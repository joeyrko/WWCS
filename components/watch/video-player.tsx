"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { getVideoEmbed } from "@/lib/video-embed";

export function VideoPlayer({ src, title }: { src: string; title: string }) {
  const embed = getVideoEmbed(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedActivated, setEmbedActivated] = useState(false);

  function enterFullscreen(target: Element | null) {
    if (!target) return;
    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    } else {
      // iOS Safari only exposes fullscreen on the <video> element itself.
      (target as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
    }
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-md border border-wwc-grey-800 bg-black">
      {embed.kind === "file" ? (
        <video
          controls
          className="aspect-video w-full"
          // Fires synchronously from the click on the native play control, so
          // this is still within the browser's user-gesture window and the
          // fullscreen request is allowed.
          onPlay={(e) => enterFullscreen(e.currentTarget)}
        >
          <source src={src} />
        </video>
      ) : (
        <>
          <iframe
            src={embed.embedUrl}
            title={title}
            className="aspect-video w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
          {!embedActivated && (
            // Cross-origin embeds never let the parent page see a click
            // inside them, so there's no "on play" event to hook. This
            // transparent overlay captures the viewer's first click instead —
            // a real gesture we can use to enter fullscreen immediately —
            // then gets out of the way so the click after it reaches the
            // embedded player's own play button as normal.
            <button
              type="button"
              aria-label={`Play ${title} fullscreen`}
              onClick={() => {
                enterFullscreen(containerRef.current);
                setEmbedActivated(true);
              }}
              className="group absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-wwc-red text-white shadow-lg shadow-black/50 transition-transform group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
