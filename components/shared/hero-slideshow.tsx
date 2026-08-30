"use client";

import { useEffect, useState } from "react";
import { Poster } from "@/components/media/poster";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 5000;

export function HeroSlideshow({
  videos,
}: {
  videos: { id: string; slug: string; title: string }[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (videos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % videos.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [videos.length]);

  if (videos.length === 0) return null;

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {videos.map((video, i) => (
        <div
          key={video.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Poster
            seed={video.slug}
            title={video.title}
            monogram={false}
            showLabel={false}
            className="h-full w-full rounded-none"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-wwc-black via-wwc-black/85 to-wwc-black/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(0,56,240,0.22),transparent)]" />
    </div>
  );
}
