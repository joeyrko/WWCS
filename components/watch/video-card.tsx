import Link from "next/link";
import { Play } from "lucide-react";
import { Poster } from "@/components/media/poster";
import type { Video } from "@/types";

const SHOW_TYPE_LABEL: Record<Video["showType"], string> = {
  ppv: "PPV Replay",
  "weekly-show": "Weekly Show",
  "full-match": "Full Match",
  highlight: "Highlight",
  documentary: "Documentary",
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
            aspect="square"
            monogram={false}
            showLabel={false}
          />

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
