import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Poster } from "@/components/media/poster";
import { LiveBadge } from "@/components/shared/live-badge";
import { formatDate } from "@/lib/utils";
import { getWrestlerBySlug } from "@/data/wrestlers";
import type { WwcEvent } from "@/types";

export function EventCard({ event }: { event: WwcEvent }) {
  const mainMatch = event.matchCard[0];
  const matchup = mainMatch
    ? mainMatch.participants.map((slug) => getWrestlerBySlug(slug)?.name ?? slug).join(" vs. ")
    : null;

  return (
    <Link href={`/events/${event.slug}`} className="group relative block w-full">
      <div className="relative z-0 transition-transform duration-300 ease-out group-hover:z-20 group-hover:scale-105">
        <div className="relative overflow-hidden rounded-sm shadow-lg shadow-black/50">
          <Poster
            seed={event.slug}
            title={event.title}
            subtitle={event.tagline}
            aspect="video"
            showLabel={false}
          />
          {event.status === "live" && (
            <div className="absolute left-2 top-2">
              <LiveBadge />
            </div>
          )}

          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <h3 className="line-clamp-1 font-display text-sm uppercase leading-tight tracking-wide text-white">
              {event.title}
            </h3>
            {matchup && <p className="mt-0.5 line-clamp-1 text-xs text-wwc-grey-300">{matchup}</p>}
            <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-wwc-grey-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {formatDate(event.date, { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {event.city}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
