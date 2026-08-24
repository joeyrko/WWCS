"use client";

import { useEffect, useRef, useState } from "react";
import { getVideoEmbed } from "@/lib/video-embed";

const TRAILER_SRC = "/mock-media/trailer.mp4";

export function VideoPlayer({ src, title }: { src: string; title: string }) {
  const embed = getVideoEmbed(src);
  const containerRef = useRef<HTMLDivElement>(null);
  // Every video/stream opens with this trailer first — no way to skip it,
  // it just plays through and onEnded below hands off to the real content.
  const [showTrailer, setShowTrailer] = useState(true);

  function enterFullscreen(target: Element | null) {
    if (!target) return;
    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    } else {
      // iOS Safari only exposes fullscreen on the <video> element itself.
      (target as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
    }
  }

  useEffect(() => {
    if (showTrailer) return;
    if (embed.kind === "file") return;
    // Embeds autoplay themselves (see lib/video-embed.ts), so there's no
    // "play" event on our side to hook — this is the closest equivalent.
    // Most browsers reject a fullscreen request that isn't tied to a direct
    // user gesture and this just no-ops there; it's meant for contexts that
    // don't enforce that (namely this site's Android TV app).
    enterFullscreen(containerRef.current);
  }, [embed.kind, showTrailer]);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-md border border-wwc-grey-800 bg-black">
      {showTrailer ? (
        <video
          key="trailer"
          autoPlay
          controls
          className="aspect-video w-full"
          onPlay={(e) => enterFullscreen(e.currentTarget)}
          onEnded={() => setShowTrailer(false)}
        >
          <source src={TRAILER_SRC} />
        </video>
      ) : embed.kind === "file" ? (
        <video
          key={src}
          autoPlay
          controls
          className="aspect-video w-full"
          // Fires as soon as playback actually starts — covers both the
          // autoplay above and a manual click on the native controls.
          onPlay={(e) => enterFullscreen(e.currentTarget)}
        >
          <source src={src} />
        </video>
      ) : (
        <iframe
          key={embed.embedUrl}
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
