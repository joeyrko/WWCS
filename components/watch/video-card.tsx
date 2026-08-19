import Link from "next/link";
import { Play } from "lucide-react";
import { Poster } from "@/components/media/poster";
import { AccessBadge } from "@/components/shared/access-badge";
import type { Video } from "@/types";

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

const SHOW_TYPE_LABEL: Record<Video["showType"], string> = {
  ppv: "PPV Replay",
  "weekly-show": "Weekly Show",
  "full-match": "Full Match",
  highlight: "Highlight",
};

export function VideoCard({ video, className }: { video: Video; className?: string }) {
  return (
    <Link
      href={`/watch/${video.slug}`}
      className={`glow-red group flex w-full flex-col overflow-hidden rounded-md border border-wwc-grey-800 bg-wwc-grey-950 transition-transform duration-200 hover:-translate-y-1 ${className ?? ""}`}
    >
      <div className="relative">
        <Poster seed={video.slug} title={video.title} aspect="video" monogram={false} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/30 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-wwc-red/90 text-wwc-white">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded-sm bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {formatDuration(video.durationSeconds)}
        </span>
        <div className="absolute left-2 top-2">
          <AccessBadge access={video.access} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-wwc-red">
          {SHOW_TYPE_LABEL[video.showType]}
        </span>
        <h3 className="line-clamp-2 font-display text-base uppercase leading-tight tracking-wide text-wwc-white transition-colors group-hover:text-wwc-red">
          {video.title}
        </h3>
      </div>
    </Link>
  );
}
