import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EventCard } from "@/components/events/event-card";
import { VideoCard } from "@/components/watch/video-card";
import { ContentRow } from "@/components/shared/content-row";
import { SponsorSlideshow } from "@/components/shared/sponsor-slideshow";
import { Reveal } from "@/components/motion/reveal";
import { getPastEvents, getUpcomingEvents } from "@/lib/data/events";
import { searchVideos } from "@/lib/data/videos";
import { sponsors } from "@/data/sponsors";

export const metadata: Metadata = {
  title: "Live Events",
  description: "Every upcoming WWC live pay-per-view event, plus replays of past shows.",
};

export default async function EventsPage() {
  const [upcoming, past, documentaries] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
    searchVideos({ showType: "documentary" }),
  ]);
  const live = upcoming.filter((e) => e.status === "live");
  const scheduled = upcoming.filter((e) => e.status !== "live");

  return (
    <>
      <PageHeader
        eyebrow="Events Hub"
        title="Live Events"
        description="Every upcoming WWC show — live, Never miss a Moment"
        centered
        className="border-transparent bg-transparent"
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
            <ContentRow title="Past Events">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </ContentRow>
          </Reveal>
        )}

        {documentaries.length > 0 && (
          <Reveal>
            <ContentRow title="Documentaries">
              {documentaries.map((video) => (
                <VideoCard key={video.id} video={video} />
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
