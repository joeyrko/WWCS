import { getSession } from "@/lib/get-session";
import { getTrendingVideos } from "@/lib/data/videos";
import { VideoCard } from "@/components/watch/video-card";
import { StaggerGrid } from "@/components/motion/stagger-grid";

export async function ContinueWatchingSection() {
  const session = await getSession();
  if (!session?.user) return null;

  const videos = await getTrendingVideos(8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
          Continue Watching
        </h2>
        <p className="mt-2 text-wwc-grey-400">
          Welcome back, {session.user.name?.split(" ")[0] ?? "Fan"}. Trending on WWC+ right now.
        </p>
      </div>

      <StaggerGrid
        className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2"
        itemClassName="w-64 shrink-0 sm:w-72"
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </StaggerGrid>
    </section>
  );
}
