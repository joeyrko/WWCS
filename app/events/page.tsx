import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EventCard } from "@/components/events/event-card";
import { PastEventRow } from "@/components/events/past-event-row";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { getPastEvents, getUpcomingEvents } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Live Events & PPV",
  description: "Every upcoming WWC live pay-per-view event, plus replays of past shows.",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <>
      <PageHeader
        eyebrow="Events Hub"
        title="Live Events & PPV"
        description="Every upcoming WWC show — live, included, or pay-per-view. Never miss a night."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
          Upcoming
        </h2>
        {upcoming.length > 0 ? (
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </StaggerGrid>
        ) : (
          <p className="text-wwc-grey-400">No upcoming events scheduled right now — check back soon.</p>
        )}
      </section>

      <section className="border-t border-wwc-grey-900 bg-wwc-grey-950/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
            Past Events &amp; Replays
          </h2>
          <StaggerGrid className="flex flex-col gap-4">
            {past.map((event) => (
              <PastEventRow key={event.id} event={event} />
            ))}
          </StaggerGrid>
        </div>
      </section>
    </>
  );
}
