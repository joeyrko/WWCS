import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/shared/countdown";
import { LiveBadge } from "@/components/shared/live-badge";
import { CheckoutButton } from "@/components/shared/checkout-button";
import { StaggerIn } from "@/components/motion/stagger-in";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";
import { getWrestlerBySlug } from "@/data/wrestlers";
import type { WwcEvent } from "@/types";

export function Hero({
  event,
  liveEvent,
}: {
  event: WwcEvent;
  liveEvent?: WwcEvent;
}) {
  const mainMatch = event.matchCard[0];
  const matchup = mainMatch
    ?.participants.map((slug) => getWrestlerBySlug(slug)?.name ?? slug)
    .join(" vs. ");

  return (
    <section className="relative isolate overflow-hidden bg-wwc-black pb-20 pt-14 sm:pb-28 sm:pt-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,20,26,0.28),transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-wwc-black via-wwc-black/95 to-wwc-black"
      />

      <div className="clip-diagonal absolute inset-x-0 top-0 -z-20 h-full bg-gradient-to-br from-wwc-red-dark/30 via-wwc-black to-wwc-black" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {liveEvent && (
          <Reveal y={-12} className="mb-8 w-fit">
            <Link
              href={`/events/${liveEvent.slug}`}
              className="flex w-fit items-center gap-3 rounded-sm border border-wwc-red/40 bg-wwc-red/10 px-4 py-2 text-sm font-semibold text-wwc-white transition-colors hover:bg-wwc-red/20"
            >
              <LiveBadge />
              {liveEvent.title} is streaming now — tap to watch
            </Link>
          </Reveal>
        )}

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <StaggerIn>
            <span className="mb-4 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
              Next Live PPV
            </span>
            <h1 className="text-gradient-red font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>
            <div>
              <p className="mt-4 max-w-lg text-lg text-wwc-grey-300">{event.tagline}</p>
              {matchup && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-wwc-grey-400">
                  Main Event: <span className="text-wwc-white">{matchup}</span>
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-1.5 text-sm text-wwc-grey-400">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-wwc-red" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-wwc-red" />
                {event.venue} — {event.city}
              </span>
            </div>

            <div className="mt-8">
              <Countdown target={event.date} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {event.includedInSubscription ? (
                <Button asChild size="lg">
                  <Link href="/pricing">Subscribe to Watch</Link>
                </Button>
              ) : (
                <CheckoutButton size="lg" payload={{ type: "ppv", eventSlug: event.slug }}>
                  Order Now — ${(event.priceInCents / 100).toFixed(2)}
                </CheckoutButton>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href={`/events/${event.slug}`}>View Match Card</Link>
              </Button>
            </div>
          </StaggerIn>

          <Reveal
            delay={0.15}
            y={16}
            className="hidden aspect-[3/4] w-full max-w-md justify-self-end lg:block"
          >
            <div className="relative h-full w-full overflow-hidden rounded-md border border-wwc-grey-800">
              <div className="absolute inset-0 bg-gradient-to-br from-wwc-red-dark via-wwc-black to-wwc-black" />
              <div className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(115deg,#fff_0,#fff_1px,transparent_1px,transparent_16px)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.9)_100%)]" />
              <span className="absolute right-4 top-4 font-display text-2xl tracking-wider text-white/15">
                WWC
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-3xl uppercase leading-none tracking-wide text-white">
                  {event.title}
                </p>
                <p className="mt-2 text-sm text-white/70">{event.city}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
