import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { UpcomingEventsSection } from "@/components/home/upcoming-events-section";
import { ContinueWatchingSection } from "@/components/home/continue-watching-section";
import { PlansTeaser } from "@/components/home/plans-teaser";
import { getFeaturedEvent, getLiveEvent } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Home",
  description:
    "World Wrestling Council — stream every live PPV and the full on-demand library on WWC+.",
};

export default async function HomePage() {
  const [featuredEvent, liveEvent] = await Promise.all([getFeaturedEvent(), getLiveEvent()]);

  return (
    <>
      {featuredEvent && <Hero event={featuredEvent} liveEvent={liveEvent} />}
      <UpcomingEventsSection />
      <ContinueWatchingSection />
      <PlansTeaser />
    </>
  );
}
