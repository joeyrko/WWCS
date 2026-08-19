import { events } from "@/data/events";
import type { WwcEvent } from "@/types";

// Repository layer for event data. Swap the `data/events` import for a real
// API/CMS client later — call sites elsewhere in the app do not need to change.

export async function getAllEvents(): Promise<WwcEvent[]> {
  return events;
}

export async function getUpcomingEvents(): Promise<WwcEvent[]> {
  return events
    .filter((e) => e.status === "upcoming" || e.status === "live")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getPastEvents(): Promise<WwcEvent[]> {
  return events
    .filter((e) => e.status === "past")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getFeaturedEvent(): Promise<WwcEvent | undefined> {
  const upcoming = await getUpcomingEvents();
  const nextPpv = upcoming.find((e) => e.status === "upcoming" && !e.includedInSubscription);
  return nextPpv ?? upcoming[0];
}

export async function getLiveEvent(): Promise<WwcEvent | undefined> {
  return events.find((e) => e.status === "live");
}

export async function getEventBySlug(slug: string): Promise<WwcEvent | undefined> {
  return events.find((e) => e.slug === slug);
}
