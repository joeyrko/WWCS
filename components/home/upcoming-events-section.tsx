import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { getUpcomingEvents } from "@/lib/data/events";

export async function UpcomingEventsSection() {
  const events = (await getUpcomingEvents()).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
            Upcoming Events
          </h2>
          <p className="mt-2 text-wwc-grey-400">Mark your calendar. The action doesn&apos;t stop.</p>
        </div>
        <Link
          href="/events"
          className="hidden items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-wwc-red hover:text-wwc-red-glow sm:flex"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <Link
        href="/events"
        className="mt-8 flex items-center justify-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-wwc-red sm:hidden"
      >
        View All Events <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
