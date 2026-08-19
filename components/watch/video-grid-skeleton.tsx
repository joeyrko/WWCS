import { Skeleton } from "@/components/ui/skeleton";

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}
