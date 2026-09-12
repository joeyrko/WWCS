import { supabase } from "@/lib/supabase";
import type { Sponsor } from "@/types";

// Sponsor logos managed from /admin — real uploaded files in Supabase
// Storage (bucket "sponsor-images", public), with metadata in the
// `sponsors` table. No static fallback list: if nothing's saved here, the
// slideshow renders nothing (see components/shared/sponsor-slideshow.tsx).

const BUCKET = "sponsor-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);

interface SponsorRow {
  id: string;
  name: string;
  tagline: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

function toSponsor(row: SponsorRow): Sponsor {
  return { id: row.id, name: row.name, tagline: row.tagline, imageUrl: row.image_url };
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  const { data } = await supabase
    .from("sponsors")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []).map(toSponsor);
}

function extFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
  };
  return map[mimeType] ?? "bin";
}

// Storage-only validation lives here rather than in the API route — the
// route just forwards whatever error message this throws.
export async function createSponsor(input: { name: string; tagline: string; file: File }): Promise<Sponsor> {
  if (!ALLOWED_TYPES.has(input.file.type)) {
    throw new Error("Unsupported image type. Use PNG, JPEG, WebP, GIF, or SVG.");
  }
  if (input.file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large — 5MB max.");
  }

  const path = `${crypto.randomUUID()}.${extFromMimeType(input.file.type)}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (uploadError) throw new Error("Unable to upload image.");

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: maxOrderRow } = await supabase
    .from("sponsors")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxOrderRow?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("sponsors")
    .insert({ name: input.name, tagline: input.tagline, image_url: publicUrl, display_order: nextOrder })
    .select("*")
    .single();
  if (error || !data) {
    // Don't leave an orphaned file behind if the DB insert failed.
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error("Unable to save sponsor.");
  }
  return toSponsor(data);
}

// Only ever called with a path under our own bucket's public URL (built by
// getPublicUrl above), so slicing after the known prefix is safe here.
function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  return i === -1 ? null : publicUrl.slice(i + marker.length);
}

export async function deleteSponsor(id: string): Promise<void> {
  const { data } = await supabase.from("sponsors").select("image_url").eq("id", id).maybeSingle();
  await supabase.from("sponsors").delete().eq("id", id);

  if (data?.image_url) {
    const path = storagePathFromPublicUrl(data.image_url);
    // Only remove files this table actually owns in Storage — the two
    // migrated launch sponsors point at /public files bundled with the app,
    // not Storage objects, and have no such path.
    if (path) await supabase.storage.from(BUCKET).remove([path]);
  }
}
