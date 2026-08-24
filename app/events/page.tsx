import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { StaggerIn } from "@/components/motion/stagger-in";
import { HeroSlideshow } from "@/components/shared/hero-slideshow";
import { VideoCard } from "@/components/events/video-card";
import { ContentRow } from "@/components/shared/content-row";
import { SponsorSlideshow } from "@/components/shared/sponsor-slideshow";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { Reveal } from "@/components/motion/reveal";
import { getAllVideos, searchVideos, type VideoFilters } from "@/lib/data/videos";
import { sponsors } from "@/data/sponsors";
import type { Video } from "@/types";

export const metadata: Metadata = {
  title: "Home",
  description: "Browse the full WWC on-demand library — PPV replays, weekly shows, full matches, and highlights.",
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const DECADE_LABELS: Record<number, string> = {
  1990: "Past Events",
  2000: "Documentaries",
};
const DECADES = [1990, 2000];
const UPCOMING_DECADE = 1980;
const ROW_ITEM_CLASS = "w-60 sm:w-72 lg:w-80";
const LIVE_ITEM_CLASS = "w-80 sm:w-[26rem] lg:w-[34rem]";
// The single card shown in the Live row — identified by slug rather than
// bucketed by decade, since its date is a real (near-future) one, unlike the
// rest of this mock data's historical dates.
const LIVE_VIDEO_SLUG = "terremoto-founding-territory-match-1973";

function decadeOf(publishedAt: string): number {
  return Math.floor(new Date(publishedAt).getFullYear() / 10) * 10;
}

export default async function HomePage({
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

  const all = await getAllVideos();
  const upcoming = all.filter((video) => decadeOf(video.publishedAt) === UPCOMING_DECADE);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-wwc-grey-900 pb-14 pt-28 sm:pb-24 sm:pt-36">
        <HeroSlideshow videos={upcoming} />
        <StaggerIn className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-3 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
            WWC+
          </span>
          <h1 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
            Every Match. Every Replay. Unlimited Access.
          </h1>
          <p className="mt-3 max-w-2xl text-wwc-grey-400">
            Grab your tickets, cop official gear, and catch the latest news at
            WORLDWRESTLINGCOUNCIL.COM
          </p>
        </StaggerIn>
      </section>

      {hasActiveFilters ? (
        <FilteredResults filters={{ query: q || undefined, showType: type as VideoFilters["showType"], wrestlerSlug: wrestler === "all" ? undefined : wrestler, sort: sort === "oldest" ? "oldest" : "newest" }} />
      ) : (
        <BrowseRows videos={all} />
      )}

      <Reveal>
        <div className="pb-10 sm:pb-14">
          <h2 className="mb-4 px-4 font-display text-2xl uppercase tracking-wide text-white sm:px-6 lg:px-8">
            Our Sponsors
          </h2>
          <SponsorSlideshow sponsors={sponsors} />
        </div>
      </Reveal>
    </>
  );
}

function BrowseRows({ videos }: { videos: Video[] }) {
  const liveVideo = videos.find((video) => video.slug === LIVE_VIDEO_SLUG);

  const byDecade = new Map<number, Video[]>();
  for (const video of videos) {
    if (video.slug === LIVE_VIDEO_SLUG) continue;
    const decade = decadeOf(video.publishedAt);
    const list = byDecade.get(decade) ?? [];
    list.push(video);
    byDecade.set(decade, list);
  }

  return (
    <div className="flex flex-col gap-10 py-10 sm:py-14">
      {liveVideo && (
        <Reveal>
          <ContentRow title="Live" itemClassName={LIVE_ITEM_CLASS}>
            <VideoCard video={liveVideo} aspect="video" />
          </ContentRow>
        </Reveal>
      )}
      {DECADES.map((decade) => {
        const rowVideos = byDecade.get(decade) ?? [];
        if (rowVideos.length === 0) return null;
        return (
          <Reveal key={decade}>
            <ContentRow title={DECADE_LABELS[decade]} itemClassName={ROW_ITEM_CLASS}>
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
