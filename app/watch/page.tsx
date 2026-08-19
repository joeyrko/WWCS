import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FiltersBar } from "@/components/watch/filters-bar";
import { VideoCard } from "@/components/watch/video-card";
import { searchVideos, type VideoFilters } from "@/lib/data/videos";
import { getAllWrestlers } from "@/lib/data/wrestlers";

export const metadata: Metadata = {
  title: "Watch Library",
  description: "Browse the full WWC on-demand library — PPV replays, weekly shows, full matches, and highlights.",
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = firstValue(params.q);
  const type = firstValue(params.type) || "all";
  const wrestler = firstValue(params.wrestler) || "all";
  const sort = firstValue(params.sort) || "newest";

  const filters: VideoFilters = {
    query: q || undefined,
    showType: type as VideoFilters["showType"],
    wrestlerSlug: wrestler === "all" ? undefined : wrestler,
    sort: sort === "oldest" ? "oldest" : "newest",
  };

  const [videos, wrestlers] = await Promise.all([searchVideos(filters), getAllWrestlers()]);

  return (
    <>
      <PageHeader
        eyebrow="On-Demand"
        title="Watch Library"
        description="Full shows, full matches, and highlights — anytime."
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <FiltersBar
            wrestlers={wrestlers.map((w) => ({ slug: w.slug, name: w.name }))}
            current={{ q, type, wrestler, sort }}
          />
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-wwc-grey-800 py-20 text-center">
            <SearchX className="h-10 w-10 text-wwc-grey-600" />
            <p className="font-display text-xl uppercase tracking-wide text-white">
              No results found
            </p>
            <p className="max-w-sm text-sm text-wwc-grey-500">
              Try a different search term or clear your filters to see the full library.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
