import { videos as staticVideos } from "@/data/videos";
import { getAllLiveEvents, getLiveEventBySlug, toVideo } from "@/lib/data/live-events";
import type { ShowType, Video } from "@/types";

export interface VideoFilters {
  showType?: ShowType | "all";
  wrestlerSlug?: string;
  query?: string;
  sort?: "newest" | "oldest";
}

// Live events created from /admin (a real table) are merged in alongside
// the static catalog (data/videos.ts) everywhere videos are listed, looked
// up, searched, or related — so the rest of the app never needs a separate
// code path for one vs. the other.
export async function getAllVideos(): Promise<Video[]> {
  const liveEvents = await getAllLiveEvents();
  return [...staticVideos, ...liveEvents.map(toVideo)];
}

export async function getVideoBySlug(slug: string): Promise<Video | undefined> {
  const staticMatch = staticVideos.find((v) => v.slug === slug);
  if (staticMatch) return staticMatch;
  const liveEvent = await getLiveEventBySlug(slug);
  return liveEvent ? toVideo(liveEvent) : undefined;
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
