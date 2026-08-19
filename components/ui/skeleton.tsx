import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-wwc-grey-800", className)}
      {...props}
    />
  );
}

export { Skeleton };
