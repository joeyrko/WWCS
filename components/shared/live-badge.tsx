import { cn } from "@/lib/utils";

export function LiveBadge({ className, label = "Live" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm bg-wwc-red px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-wwc-white",
        className
      )}
    >
      <span className="h-2 w-2 animate-pulse-live rounded-full bg-white" />
      {label}
    </span>
  );
}
