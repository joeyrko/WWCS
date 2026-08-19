import { VideoCard } from "@/components/watch/video-card";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import type { Video } from "@/types";

export function RelatedVideosRail({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-display text-2xl uppercase tracking-wide text-white">
        More Like This
      </h2>
      <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </StaggerGrid>
    </div>
  );
}
