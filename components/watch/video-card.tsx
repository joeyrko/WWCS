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
      className={`group relative block w-full ${className ?? ""}`}
    >
      <div className="relative z-0 transition-transform duration-300 ease-out group-hover:z-20 group-hover:scale-105">
        <div className="relative overflow-hidden rounded-sm shadow-lg shadow-black/50">
          <Poster
            seed={video.slug}
            title={video.title}
            aspect="video"
            monogram={false}
            showLabel={false}
          />
          <div className="absolute left-2 top-2">
            <AccessBadge access={video.access} />
          </div>
          <span className="absolute bottom-2 right-2 rounded-sm bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {formatDuration(video.durationSeconds)}
          </span>

          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/75 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-wwc-red">
              {SHOW_TYPE_LABEL[video.showType]}
            </span>
            <h3 className="line-clamp-2 font-display text-sm uppercase leading-tight tracking-wide text-white">
              {video.title}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
