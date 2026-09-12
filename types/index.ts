export type PlanId = "monthly" | "annual" | "legacy";

export interface Wrestler {
  id: string;
  slug: string;
  name: string;
  gimmick: string;
  imageUrl: string;
  height: string;
  weight: string;
  hometown: string;
  record: { wins: number; losses: number; draws: number };
  bio: string;
  finisher: string;
}

export type AccessLevel = "free" | "subscribers" | "purchase";

// "live-event" keeps its old value — it's what lib/geo-fence.ts checks to
// decide whether a video gets the Puerto Rico blackout treatment, and it's
// exclusively assigned via the separate live_events table/admin section
// (see lib/data/live-events.ts), never picked directly from a dropdown.
// The decade values are the same categories the History/Home pages already
// group archival footage into by date — here they're a real, admin-picked
// category instead of being computed from publishedAt.
export type ShowType =
  | "live-event"
  | "tv-event"
  | "documentary"
  | "dark-match"
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

export interface Video {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationSeconds: number;
  publishedAt: string; // ISO 8601
  showType: ShowType;
  access: AccessLevel;
  wrestlers: string[]; // wrestler slugs
  relatedEventSlug?: string;
  location?: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceInCents: number;
  interval: "month" | "year" | null;
  tagline: string;
  features: string[];
  highlighted?: boolean;
  badgeLabel?: string;
  stripePriceEnvVar?: string;
}

export interface Order {
  id: string;
  userId: string;
  type: "ppv" | "subscription";
  label: string;
  amountInCents: number;
  createdAt: string;
  status: "paid" | "refunded" | "pending";
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  plan: PlanId | null;
  purchasedEventSlugs: string[];
  isAdmin?: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  // When set, the slideshow renders this artwork instead of the gradient
  // name/tagline card — used for real sponsor board graphics.
  imageUrl?: string;
}
