"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: string): TimeLeft {
  const diff = Math.max(new Date(target).getTime() - Date.now(), 0);
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({
  target,
  className,
  liveLabel = "Live Now",
}: {
  target: string;
  className?: string;
  liveLabel?: string;
}) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Deliberately set on mount (not in the lazy initializer) so the server-rendered
    // "--" placeholder matches the first client render, avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(getTimeLeft(target));
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: "Days", value: time?.days },
    { label: "Hrs", value: time?.hours },
    { label: "Min", value: time?.minutes },
    { label: "Sec", value: time?.seconds },
  ];

  if (time && time.total <= 0) {
    return (
      <p className={cn("font-display text-xl uppercase tracking-wide text-wwc-red", className)}>
        {liveLabel}
      </p>
    );
  }

  return (
    <div className={cn("flex gap-2.5 sm:gap-3", className)}>
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-[3.25rem] flex-col items-center rounded-sm border border-wwc-grey-800 bg-wwc-black/60 px-2.5 py-2 sm:min-w-[3.75rem]"
        >
          <span className="font-display text-xl tabular-nums text-white sm:text-2xl">
            {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-wwc-grey-400">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
