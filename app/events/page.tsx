import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EventCard } from "@/components/events/event-card";
import { ContentRow } from "@/components/shared/content-row";
import { SponsorSlideshow } from "@/components/events/sponsor-slideshow";
import { Reveal } from "@/components/motion/reveal";
import { getPastEvents, getUpcomingEvents } from "@/lib/data/events";
import { sponsors } from "@/data/sponsors";

export const metadata: Metadata = {
  title: "Live Events & PPV",
  description: "Every upcoming WWC live pay-per-view event, plus replays of past shows.",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);
  const live = upcoming.filter((e) => e.status === "live");
  const scheduled = upcoming.filter((e) => e.status !== "live");

  return (
    <>
      <PageHeader
        eyebrow="Events Hub"
        title="Live Events & PPV"
        description="Every upcoming WWC show — live, included, or pay-per-view. Never miss a night."
      />

      <div className="flex flex-col gap-10 py-10 sm:py-14">
        {live.length > 0 && (
          <Reveal>
            <ContentRow title="Live Now">
              {live.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </ContentRow>
          </Reveal>
        )}

        {scheduled.length > 0 ? (
          <Reveal>
            <ContentRow title="Upcoming Events">
              {scheduled.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </ContentRow>
          </Reveal>
        ) : (
          live.length === 0 && (
            <p className="px-4 text-wwc-grey-400 sm:px-6 lg:px-8">
              No upcoming events scheduled right now — check back soon.
            </p>
          )
        )}

        {past.length > 0 && (
          <Reveal>
            <ContentRow title="Past Events & Replays">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </ContentRow>
          </Reveal>
        )}

        <Reveal>
          <div>
            <h2 className="mb-4 px-4 font-display text-2xl uppercase tracking-wide text-white sm:px-6 lg:px-8">
              Our Sponsors
            </h2>
            <SponsorSlideshow sponsors={sponsors} />
          </div>
        </Reveal>
      </div>
    </>
  );
}
