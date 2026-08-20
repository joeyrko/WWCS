"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Sponsor } from "@/data/sponsors";

const GRADIENTS = [
  "from-wwc-red-dark via-wwc-black to-wwc-black",
  "from-wwc-grey-800 via-wwc-black to-wwc-red-dark",
  "from-wwc-black via-wwc-grey-900 to-wwc-red-dark",
  "from-wwc-red-dark via-wwc-grey-900 to-wwc-black",
];

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const AUTO_ADVANCE_MS = 4000;

export function SponsorSlideshow({ sponsors }: { sponsors: Sponsor[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || sponsors.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % sponsors.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, sponsors.length]);

  if (sponsors.length === 0) return null;

  return (
    <div
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-md sm:aspect-[4/1]">
        {sponsors.map((sponsor, i) => {
          if (sponsor.imageUrl) {
            return (
              <div
                key={sponsor.id}
                aria-hidden={i !== index}
                className={cn(
                  "absolute inset-0 bg-black transition-opacity duration-700 ease-out",
                  i === index ? "opacity-100" : "opacity-0"
                )}
              >
                <Image
                  src={sponsor.imageUrl}
                  alt={sponsor.name}
                  fill
                  className="object-contain"
                  sizes="(min-width: 1280px) 1152px, 100vw"
                />
              </div>
            );
          }

          const gradient = GRADIENTS[hashSeed(sponsor.id) % GRADIENTS.length];
          return (
            <div
              key={sponsor.id}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br text-center transition-opacity duration-700 ease-out",
                gradient,
                i === index ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0,#fff_1px,transparent_1px,transparent_14px)]" />
              <p className="relative z-10 font-display text-2xl uppercase tracking-wide text-white sm:text-4xl">
                {sponsor.name}
              </p>
              <p className="relative z-10 mt-2 text-xs uppercase tracking-[0.2em] text-white/60 sm:text-sm">
                {sponsor.tagline}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {sponsors.map((sponsor, i) => (
          <button
            key={sponsor.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${sponsor.name}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-wwc-red" : "w-1.5 bg-wwc-grey-700 hover:bg-wwc-grey-500"
            )}
          />
        ))}
      </div>
    </div>
  );
}
