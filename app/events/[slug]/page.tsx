import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { events } from "@/data/events";
import { getEventBySlug } from "@/lib/data/events";
import { userHasAccessToEvent } from "@/lib/data/users";
import { Countdown } from "@/components/shared/countdown";
import { LiveBadge } from "@/components/shared/live-badge";
import { Badge } from "@/components/ui/badge";
import { MatchCardList } from "@/components/events/match-card-list";
import { EventAccessPanel } from "@/components/events/event-access-panel";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};

  return {
    title: event.title,
    description: event.description,
    openGraph: { title: event.title, description: event.description },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const session = await getSession();
  const hasAccess = userHasAccessToEvent(session?.user, event);

  return (
    <>
      <section className="relative overflow-hidden border-b border-wwc-grey-900 bg-wwc-grey-950 py-14 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(224,20,26,0.22),transparent)]"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {event.status === "live" && <LiveBadge />}
            {event.includedInSubscription ? (
              <Badge variant="subscribers">Included with WWC+</Badge>
            ) : (
              <Badge variant="purchase">Pay-Per-View</Badge>
            )}
          </div>

          <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-wide text-white sm:text-6xl">
            {event.title}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-wwc-grey-300">{event.tagline}</p>

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

          {event.status !== "past" && (
            <div className="mt-8">
              <Countdown target={event.date} />
            </div>
          )}

          <div className="mt-8">
            <EventAccessPanel event={event} hasAccess={hasAccess} isSignedIn={!!session?.user} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-10 text-wwc-grey-300">{event.description}</p>

        <h2 className="mb-6 font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
          Match Card
        </h2>
        <MatchCardList matches={event.matchCard} />

        <div className="mt-10 border-t border-wwc-grey-900 pt-6">
          <Link href="/events" className="text-sm font-semibold text-wwc-red hover:underline">
            ← Back to all events
          </Link>
        </div>
      </section>
    </>
  );
}
