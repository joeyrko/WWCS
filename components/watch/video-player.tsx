"use client";

import { useEffect, useRef, useState } from "react";
import { getVideoEmbed } from "@/lib/video-embed";

const TRAILER_SRC = "/mock-media/trailer.mp4";

export function VideoPlayer({ src, title }: { src: string; title: string }) {
  const embed = getVideoEmbed(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  function handleTrailerEnded() {
    setShowTrailer(false);
    if (embed.kind !== "file") return;
    // Browsers only allow autoplay-with-sound as a continuation of an
    // already-playing <video> element's own "ended" event — a freshly
    // mounted element (or an <iframe> embed) has no such allowance and just
    // sits paused. So this reuses the trailer's own element instead of
    // swapping to a new one, and starts the real content synchronously
    // within this handler rather than waiting on React's re-render.
    const el = videoRef.current;
    if (!el) return;
    el.src = src;
    el.load();
    el.play()
      .then(() => enterFullscreen(el))
      .catch(() => {});
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
      {showTrailer || embed.kind === "file" ? (
        <video
          ref={videoRef}
          autoPlay={showTrailer}
          controls
          className="aspect-video w-full"
          onPlay={(e) => enterFullscreen(e.currentTarget)}
          onEnded={showTrailer ? handleTrailerEnded : undefined}
        >
          <source src={showTrailer ? TRAILER_SRC : src} />
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
