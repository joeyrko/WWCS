"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Poster } from "@/components/media/poster";

export function VideoPlayer({ src, title, seed }: { src: string; title: string; seed: string }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative block w-full overflow-hidden rounded-md border border-wwc-grey-800"
        aria-label={`Play ${title}`}
      >
        <Poster seed={seed} title={title} aspect="video" monogram={false} />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-200 group-hover:bg-black/40">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-wwc-red text-wwc-white shadow-lg shadow-black/50 transition-transform duration-200 group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-md border border-wwc-grey-800 bg-black">
        <video controls autoPlay className="aspect-video w-full">
          <source src={src} />
        </video>
      </div>
      <p className="text-xs text-wwc-grey-600">
        Demo playback — this project ships with placeholder video sources. Point{" "}
        <code className="text-wwc-grey-400">videoUrl</code> in{" "}
        <code className="text-wwc-grey-400">data/videos.ts</code> at real media to go live.
      </p>
    </div>
  );
}
