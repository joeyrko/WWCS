import { videos } from "@/data/videos";
import type { ShowType, Video } from "@/types";

export interface VideoFilters {
  showType?: ShowType | "all";
  wrestlerSlug?: string;
  query?: string;
  sort?: "newest" | "oldest";
}

export async function getAllVideos(): Promise<Video[]> {
  return videos;
}

export async function getVideoBySlug(slug: string): Promise<Video | undefined> {
  return videos.find((v) => v.slug === slug);
}

export async function searchVideos(filters: VideoFilters = {}): Promise<Video[]> {
  let results = [...videos];

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
  return videos
    .filter((v) => v.id !== video.id)
    .filter(
      (v) =>
        v.showType === video.showType ||
        v.wrestlers.some((w) => video.wrestlers.includes(w)) ||
        v.relatedEventSlug === video.relatedEventSlug
    )
    .slice(0, limit);
}

export async function getVideoByEventSlug(eventSlug: string): Promise<Video | undefined> {
  return videos.find((v) => v.relatedEventSlug === eventSlug && v.showType === "ppv");
}

export async function getTrendingVideos(limit = 8): Promise<Video[]> {
  return [...videos]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
