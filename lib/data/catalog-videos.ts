import { supabase } from "@/lib/supabase";
import { findSlugOwner, slugify } from "@/lib/data/video-slugs";
import { uploadEventThumbnail, deleteEventThumbnail } from "@/lib/data/event-thumbnails";
import type { AccessLevel, ShowType, Video } from "@/types";

// The rest of the catalog (everything except live events, which has its
// own table/section — see lib/data/live-events.ts) managed from /admin:
// PPV replays, weekly shows, full matches, highlights, documentaries.
// Same reasoning as live events — real rows so an admin can add/edit/remove
// without a code deploy. lib/data/videos.ts merges these in everywhere
// videos are listed/looked up, alongside the static catalog and live events.

export type CatalogShowType = Exclude<ShowType, "live-event">;

export interface CatalogVideoRow {
  id: string;
  slug: string;
  title: string;
  videoUrl: string;
  location: string | null;
  description: string;
  showType: CatalogShowType;
  access: AccessLevel;
  publishedAt: string; // ISO 8601
  thumbnailUrl: string | null;
  createdAt: string;
}

interface CatalogVideoDbRow {
  id: string;
  slug: string;
  title: string;
  video_url: string;
  location: string | null;
  description: string;
  show_type: CatalogShowType;
  access: AccessLevel;
  published_at: string;
  thumbnail_url: string | null;
  created_at: string;
}

function toRow(row: CatalogVideoDbRow): CatalogVideoRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    videoUrl: row.video_url,
    location: row.location,
    description: row.description,
    showType: row.show_type,
    access: row.access,
    publishedAt: row.published_at,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
  };
}

// Shaped to slot straight into the rest of the app's Video-based rendering
// (VideoCard, the detail pages, search/related/trending) without those
// callers needing a separate code path for DB-backed vs. static videos.
export function toVideo(row: CatalogVideoRow): Video {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    // Falls back to the slug as a seed for Poster's generated gradient card
    // when no thumbnail was uploaded.
    thumbnailUrl: row.thumbnailUrl ?? row.slug,
    videoUrl: row.videoUrl,
    durationSeconds: 0,
    publishedAt: row.publishedAt,
    showType: row.showType,
    access: row.access,
    wrestlers: [],
    location: row.location ?? undefined,
  };
}

export async function getAllCatalogVideos(): Promise<CatalogVideoRow[]> {
  const { data } = await supabase.from("catalog_videos").select("*").order("published_at", { ascending: false });
  return (data ?? []).map(toRow);
}

export async function getCatalogVideoBySlug(slug: string): Promise<CatalogVideoRow | undefined> {
  const { data } = await supabase.from("catalog_videos").select("*").eq("slug", slug).maybeSingle();
  return data ? toRow(data) : undefined;
}

// Appends -2, -3, ... only if the plain slugified title collides with an
// existing video — this table's slugs share the same /watch/[slug] and
// /events/[slug] route space as data/videos.ts AND live_events, so all
// three have to be checked.
async function uniqueSlug(title: string, staticSlugs: Set<string>, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let n = 2;
  for (;;) {
    const collidesWithStatic = staticSlugs.has(candidate);
    const owner = await findSlugOwner(candidate);
    const collides = !!owner && !(owner.table === "catalog_videos" && owner.id === excludeId);
    if (!collidesWithStatic && !collides) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

interface CatalogVideoInput {
  title: string;
  videoUrl: string;
  location: string;
  description: string;
  showType: CatalogShowType;
  access: AccessLevel;
  publishedAt: string;
  thumbnailFile: File | null;
  staticSlugs: Set<string>;
}

export async function createCatalogVideo(input: CatalogVideoInput): Promise<CatalogVideoRow> {
  const slug = await uniqueSlug(input.title, input.staticSlugs);
  const thumbnailUrl = input.thumbnailFile ? await uploadEventThumbnail(input.thumbnailFile) : null;

  const { data, error } = await supabase
    .from("catalog_videos")
    .insert({
      slug,
      title: input.title,
      video_url: input.videoUrl,
      location: input.location || null,
      description: input.description,
      show_type: input.showType,
      access: input.access,
      published_at: input.publishedAt,
      thumbnail_url: thumbnailUrl,
    })
    .select("*")
    .single();
  if (error || !data) {
    if (thumbnailUrl) await deleteEventThumbnail(thumbnailUrl);
    throw new Error("Unable to create video.");
  }
  return toRow(data);
}

export async function updateCatalogVideo(
  id: string,
  input: CatalogVideoInput & { removeThumbnail: boolean }
): Promise<CatalogVideoRow> {
  const slug = await uniqueSlug(input.title, input.staticSlugs, id);

  const { data: existing } = await supabase
    .from("catalog_videos")
    .select("thumbnail_url")
    .eq("id", id)
    .maybeSingle();
  const previousThumbnailUrl: string | null = existing?.thumbnail_url ?? null;

  let thumbnailUrl = previousThumbnailUrl;
  if (input.thumbnailFile) {
    thumbnailUrl = await uploadEventThumbnail(input.thumbnailFile);
  } else if (input.removeThumbnail) {
    thumbnailUrl = null;
  }

  const { data, error } = await supabase
    .from("catalog_videos")
    .update({
      slug,
      title: input.title,
      video_url: input.videoUrl,
      location: input.location || null,
      description: input.description,
      show_type: input.showType,
      access: input.access,
      published_at: input.publishedAt,
      thumbnail_url: thumbnailUrl,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    if (thumbnailUrl && thumbnailUrl !== previousThumbnailUrl) await deleteEventThumbnail(thumbnailUrl);
    throw new Error("Unable to update video.");
  }

  if (previousThumbnailUrl && previousThumbnailUrl !== thumbnailUrl) {
    await deleteEventThumbnail(previousThumbnailUrl);
  }

  return toRow(data);
}

export async function deleteCatalogVideo(id: string): Promise<void> {
  const { data } = await supabase.from("catalog_videos").select("thumbnail_url").eq("id", id).maybeSingle();
  await supabase.from("catalog_videos").delete().eq("id", id);
  if (data?.thumbnail_url) await deleteEventThumbnail(data.thumbnail_url);
}
