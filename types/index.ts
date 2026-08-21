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

export interface Match {
  id: string;
  title: string;
  participants: string[]; // wrestler slugs
  stipulation?: string;
  isTitleMatch?: boolean;
  titleName?: string;
}

export type AccessLevel = "free" | "subscribers" | "purchase";

export interface WwcEvent {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  posterUrl: string;
  venue: string;
  city: string;
  date: string; // ISO 8601
  status: "upcoming" | "live" | "past";
  priceInCents: number;
  includedInSubscription: boolean;
  matchCard: Match[];
  description: string;
  streamUrl?: string;
}

export type ShowType = "ppv" | "weekly-show" | "full-match" | "highlight" | "documentary";

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
