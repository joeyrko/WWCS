import { supabase } from "@/lib/supabase";

// Shared by live_events and catalog_videos — both store their optional
// uploaded thumbnail in this one public bucket. Same validation/shape as
// sponsors' image upload (see lib/data/sponsors.ts).

const BUCKET = "event-thumbnails";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function extFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] ?? "bin";
}

export async function uploadEventThumbnail(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported thumbnail type. Use PNG, JPEG, WebP, or GIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Thumbnail is too large — 5MB max.");
  }

  const path = `${crypto.randomUUID()}.${extFromMimeType(file.type)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Unable to upload thumbnail.");

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

// Only ever called with a URL this bucket actually issued (via
// uploadEventThumbnail above), so slicing after the known prefix is safe.
export async function deleteEventThumbnail(publicUrl: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return;
  const path = publicUrl.slice(i + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
