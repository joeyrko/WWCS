import { VideoCard } from "@/components/events/video-card";
import { ContentRow } from "@/components/shared/content-row";
import type { Video } from "@/types";

export function RelatedVideosRail({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;

  return (
    <ContentRow title="More Like This">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </ContentRow>
  );
}
