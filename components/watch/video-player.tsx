"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Poster } from "@/components/media/poster";
import { getVideoEmbed } from "@/lib/video-embed";

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

  const embed = getVideoEmbed(src);

  return (
    <div className="overflow-hidden rounded-md border border-wwc-grey-800 bg-black">
      {embed.kind === "file" ? (
        <video controls autoPlay className="aspect-video w-full">
          <source src={src} />
        </video>
      ) : (
        <iframe
          src={embed.embedUrl}
          title={title}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      )}
    </div>
  );
}
