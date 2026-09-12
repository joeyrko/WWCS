import { videos as staticVideos } from "@/data/videos";
import { getAllLiveEvents, getLiveEventBySlug, toVideo as liveEventToVideo } from "@/lib/data/live-events";
import {
  getAllCatalogVideos,
  getCatalogVideoBySlug,
  toVideo as catalogVideoToVideo,
} from "@/lib/data/catalog-videos";
import type { ShowType, Video } from "@/types";

export interface VideoFilters {
  showType?: ShowType | "all";
  wrestlerSlug?: string;
  query?: string;
  sort?: "newest" | "oldest";
}

// An admin-created event (live or catalog) can be saved without a link yet
// — a draft, visible in /admin so it can be finished later, but not a real
// video anyone can watch. Every static catalog entry has always shipped
// with a real videoUrl, so this is a no-op for them.
function hasLink(video: Video): boolean {
  return video.videoUrl.trim() !== "";
}

// Live events and the rest of the catalog created from /admin (real
// tables — see lib/data/live-events.ts and lib/data/catalog-videos.ts) are
// merged in alongside the static catalog (data/videos.ts) everywhere videos
// are listed, looked up, searched, or related — so the rest of the app
// never needs a separate code path for any of the three sources.
export async function getAllVideos(): Promise<Video[]> {
  const [liveEvents, catalogVideos] = await Promise.all([getAllLiveEvents(), getAllCatalogVideos()]);
  return [...staticVideos, ...liveEvents.map(liveEventToVideo), ...catalogVideos.map(catalogVideoToVideo)].filter(
    hasLink
  );
}

export async function getVideoBySlug(slug: string): Promise<Video | undefined> {
  const staticMatch = staticVideos.find((v) => v.slug === slug);
  if (staticMatch) return staticMatch;
  const liveEvent = await getLiveEventBySlug(slug);
  if (liveEvent) {
    const video = liveEventToVideo(liveEvent);
    return hasLink(video) ? video : undefined;
  }
  const catalogVideo = await getCatalogVideoBySlug(slug);
  if (!catalogVideo) return undefined;
  const video = catalogVideoToVideo(catalogVideo);
  return hasLink(video) ? video : undefined;
}

export async function searchVideos(filters: VideoFilters = {}): Promise<Video[]> {
  let results = await getAllVideos();

  if (filters.showType && filters.showType !== "all") {
    results = results.filter((v) => v.showType === filters.showType);
  }
  if (filters.wrestlerSlug) {
    results = results.filter((v) => v.wrestlers.includes(filters.wrestlerSlug!));
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (v) => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) => {
    const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return filters.sort === "oldest" ? -diff : diff;
  });

  return results;
}

export async function getRelatedVideos(video: Video, limit = 4): Promise<Video[]> {
  const all = await getAllVideos();
  return all
    .filter((v) => v.id !== video.id)
    .filter(
      (v) =>
        v.showType === video.showType ||
        v.wrestlers.some((w) => video.wrestlers.includes(w)) ||
        v.relatedEventSlug === video.relatedEventSlug
    )
    .slice(0, limit);
}

export async function getTrendingVideos(limit = 8): Promise<Video[]> {
  const all = await getAllVideos();
  return all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit);
}

// The video featured in the homepage's "Live" row — whichever live-event
// video's date is closest to right now (soonest upcoming, or most recently
// aired if none are upcoming), out of both the static catalog and anything
// added from /admin. Not tied to a fixed slug, so a newly-added live event
// takes over the spot automatically without a code change.
export async function getCurrentLiveEvent(): Promise<Video | undefined> {
  const all = await getAllVideos();
  const liveEvents = all.filter((v) => v.showType === "live-event");
  if (liveEvents.length === 0) return undefined;

  const now = Date.now();
  return liveEvents.reduce((closest, v) => {
    const vDiff = Math.abs(new Date(v.publishedAt).getTime() - now);
    const closestDiff = Math.abs(new Date(closest.publishedAt).getTime() - now);
    return vDiff < closestDiff ? v : closest;
  });
}
