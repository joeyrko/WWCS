import { supabase } from "@/lib/supabase";
import type { Video } from "@/types";

// Live events managed from /admin — unlike the rest of the catalog (a
// static array in data/videos.ts), these are real rows so an admin can add
// one without a code deploy. lib/data/videos.ts merges these in everywhere
// videos are listed/looked up, so the rest of the app never needs to know
// a given Video came from here instead of the static file.

export interface LiveEventRow {
  id: string;
  slug: string;
  title: string;
  videoUrl: string;
  location: string | null;
  description: string;
  eventDate: string; // ISO 8601
  createdAt: string;
}

interface LiveEventDbRow {
  id: string;
  slug: string;
  title: string;
  video_url: string;
  location: string | null;
  description: string;
  event_date: string;
  created_at: string;
}

function toRow(row: LiveEventDbRow): LiveEventRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    videoUrl: row.video_url,
    location: row.location,
    description: row.description,
    eventDate: row.event_date,
    createdAt: row.created_at,
  };
}

// Shaped to slot straight into the rest of the app's Video-based rendering
// (VideoCard, the detail pages, search/related/trending) without those
// callers needing a separate code path for DB-backed vs. static videos.
export function toVideo(row: LiveEventRow): Video {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.slug, // Poster renders a generated gradient card from this seed — no real image needed.
    videoUrl: row.videoUrl,
    durationSeconds: 0,
    publishedAt: row.eventDate,
    showType: "live-event",
    access: "subscribers",
    wrestlers: [],
    relatedEventSlug: row.slug,
    location: row.location ?? undefined,
  };
}

export async function getAllLiveEvents(): Promise<LiveEventRow[]> {
  const { data } = await supabase.from("live_events").select("*").order("event_date", { ascending: false });
  return (data ?? []).map(toRow);
}

export async function getLiveEventBySlug(slug: string): Promise<LiveEventRow | undefined> {
  const { data } = await supabase.from("live_events").select("*").eq("slug", slug).maybeSingle();
  return data ? toRow(data) : undefined;
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "live-event"
  );
}

// Appends -2, -3, ... only if the plain slugified title collides with an
// existing live event OR one of the static catalog's slugs — this table's
// slugs share the same /watch/[slug] and /events/[slug] route space as
// data/videos.ts, so both have to be checked.
async function uniqueSlug(title: string, staticSlugs: Set<string>, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let n = 2;
  for (;;) {
    const collidesWithStatic = staticSlugs.has(candidate);
    const existing = await getLiveEventBySlug(candidate);
    const collidesWithLiveEvent = !!existing && existing.id !== excludeId;
    if (!collidesWithStatic && !collidesWithLiveEvent) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

export async function createLiveEvent(input: {
  title: string;
  videoUrl: string;
  location: string;
  description: string;
  eventDate: string;
  staticSlugs: Set<string>;
}): Promise<LiveEventRow> {
  const slug = await uniqueSlug(input.title, input.staticSlugs);
  const { data, error } = await supabase
    .from("live_events")
    .insert({
      slug,
      title: input.title,
      video_url: input.videoUrl,
      location: input.location || null,
      description: input.description,
      event_date: input.eventDate,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error("Unable to create live event.");
  return toRow(data);
}

export async function updateLiveEvent(
  id: string,
  input: { title: string; videoUrl: string; location: string; description: string; eventDate: string; staticSlugs: Set<string> }
): Promise<LiveEventRow> {
  const slug = await uniqueSlug(input.title, input.staticSlugs, id);
  const { data, error } = await supabase
    .from("live_events")
    .update({
      slug,
      title: input.title,
      video_url: input.videoUrl,
      location: input.location || null,
      description: input.description,
      event_date: input.eventDate,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) throw new Error("Unable to update live event.");
  return toRow(data);
}

export async function deleteLiveEvent(id: string): Promise<void> {
  await supabase.from("live_events").delete().eq("id", id);
}
