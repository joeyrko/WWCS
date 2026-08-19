import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Poster } from "@/components/media/poster";
import { LiveBadge } from "@/components/shared/live-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getWrestlerBySlug } from "@/data/wrestlers";
import type { WwcEvent } from "@/types";

export function EventCard({ event }: { event: WwcEvent }) {
  const mainMatch = event.matchCard[0];
  const matchup = mainMatch
    ? mainMatch.participants
        .map((slug) => getWrestlerBySlug(slug)?.name ?? slug)
        .join(" vs. ")
    : null;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="glow-red group flex flex-col overflow-hidden rounded-md border border-wwc-grey-800 bg-wwc-grey-950 transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative">
        <Poster seed={event.slug} title={event.title} subtitle={event.tagline} aspect="video" />
        <div className="absolute left-3 top-3 flex gap-2">
          {event.status === "live" && <LiveBadge />}
          {event.includedInSubscription ? (
            <Badge variant="subscribers">Included</Badge>
          ) : (
            <Badge variant="purchase">PPV</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg uppercase leading-tight tracking-wide text-wwc-white transition-colors group-hover:text-wwc-red">
          {event.title}
        </h3>
        {matchup && <p className="line-clamp-1 text-sm text-wwc-grey-300">{matchup}</p>}
        <div className="mt-auto flex flex-col gap-1 pt-2 text-xs text-wwc-grey-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(event.date, { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
