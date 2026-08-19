import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoGridSkeleton } from "@/components/watch/video-grid-skeleton";

export default function WatchLoading() {
  return (
    <>
      <PageHeader
        eyebrow="On-Demand"
        title="Watch Library"
        description="Full shows, full matches, and highlights — anytime."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-11 w-full sm:w-72" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-44" />
            <Skeleton className="h-11 w-48" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
        <VideoGridSkeleton />
      </section>
    </>
  );
}
