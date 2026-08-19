import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FiltersBar } from "@/components/watch/filters-bar";
import { VideoCard } from "@/components/watch/video-card";
import { ContentRow } from "@/components/shared/content-row";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { Reveal } from "@/components/motion/reveal";
import { getAllVideos, getTrendingVideos, searchVideos, type VideoFilters } from "@/lib/data/videos";
import { getAllWrestlers } from "@/lib/data/wrestlers";
import type { ShowType, Video } from "@/types";

export const metadata: Metadata = {
  title: "Watch Library",
  description: "Browse the full WWC on-demand library — PPV replays, weekly shows, full matches, and highlights.",
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const SHOW_TYPE_ROWS: { type: ShowType; title: string }[] = [
  { type: "ppv", title: "PPV Replays" },
  { type: "weekly-show", title: "Weekly Shows" },
  { type: "full-match", title: "Full Matches" },
  { type: "highlight", title: "Highlights" },
];

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
  const hasActiveFilters = Boolean(q) || type !== "all" || wrestler !== "all";

  const wrestlers = await getAllWrestlers();

  return (
    <>
      <PageHeader
        eyebrow="On-Demand"
        title="Watch Library"
        description="Full shows, full matches, and highlights — anytime."
      />

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <FiltersBar
          wrestlers={wrestlers.map((w) => ({ slug: w.slug, name: w.name }))}
          current={{ q, type, wrestler, sort }}
        />
      </div>

      {hasActiveFilters ? (
        <FilteredResults filters={{ query: q || undefined, showType: type as VideoFilters["showType"], wrestlerSlug: wrestler === "all" ? undefined : wrestler, sort: sort === "oldest" ? "oldest" : "newest" }} />
      ) : (
        <BrowseRows />
      )}
    </>
  );
}

async function BrowseRows() {
  const [trending, all] = await Promise.all([getTrendingVideos(10), getAllVideos()]);
  const byType = new Map<ShowType, Video[]>();
  for (const video of all) {
    const list = byType.get(video.showType) ?? [];
    list.push(video);
    byType.set(video.showType, list);
  }

  return (
    <div className="flex flex-col gap-10 py-10 sm:py-14">
      <Reveal>
        <ContentRow title="Trending Now">
          {trending.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </ContentRow>
      </Reveal>

      {SHOW_TYPE_ROWS.map(({ type, title }) => {
        const rowVideos = byType.get(type) ?? [];
        if (rowVideos.length === 0) return null;
        return (
          <Reveal key={type}>
            <ContentRow title={title}>
              {rowVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </ContentRow>
          </Reveal>
        );
      })}
    </div>
  );
}

async function FilteredResults({ filters }: { filters: VideoFilters }) {
  const videos = await searchVideos(filters);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {videos.length > 0 ? (
        <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </StaggerGrid>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-wwc-grey-800 py-20 text-center">
          <SearchX className="h-10 w-10 text-wwc-grey-600" />
          <p className="font-display text-xl uppercase tracking-wide text-white">No results found</p>
          <p className="max-w-sm text-sm text-wwc-grey-500">
            Try a different search term or clear your filters to see the full library.
          </p>
        </div>
      )}
    </section>
  );
}
