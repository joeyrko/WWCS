import { supabase } from "@/lib/supabase";

// Shared by lib/data/live-events.ts and lib/data/catalog-videos.ts for slug
// generation/uniqueness — pulled out into its own module specifically so
// neither of those two files has to import the other (each needs to check
// the other's table too, which would otherwise be a circular import).

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "video"
  );
}

// Every DB-backed video table shares the same /watch/[slug] and
// /events/[slug] route space (along with the static catalog), so a slug
// picked for one has to be checked against all of them.
export async function findSlugOwner(
  slug: string
): Promise<{ table: "live_events" | "catalog_videos"; id: string } | null> {
  const [{ data: liveEvent }, { data: catalogVideo }] = await Promise.all([
    supabase.from("live_events").select("id").eq("slug", slug).maybeSingle(),
    supabase.from("catalog_videos").select("id").eq("slug", slug).maybeSingle(),
  ]);
  if (liveEvent) return { table: "live_events", id: liveEvent.id };
  if (catalogVideo) return { table: "catalog_videos", id: catalogVideo.id };
  return null;
}
