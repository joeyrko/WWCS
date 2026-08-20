import type { Plan } from "@/types";

// Every plan here is paid — there is no free tier and no free access to
// gated content. Signing up still creates an account without payment
// (PlanId "free" internally, see lib/data/users.ts) since checkout requires
// an existing session, but that state grants no library/event access —
// it's purely a placeholder until a plan is purchased.
export const plans: Plan[] = [
  {
    id: "monthly",
    name: "WWC+ Monthly",
    priceInCents: 699,
    interval: "month",
    tagline: "Every show. Every month.",
    features: ["Access to the entire library", "Access to live events", "Cancel anytime"],
    stripePriceEnvVar: "STRIPE_PRICE_MONTHLY",
  },
  {
    id: "annual",
    name: "WWC+ Annual",
    priceInCents: 6999,
    interval: "year",
    tagline: "Every show, all year.",
    features: [
      "Access to the entire library",
      "Access to live events",
      "Equivalent to $5.83 a month",
      "Cancel anytime",
    ],
    stripePriceEnvVar: "STRIPE_PRICE_ANNUAL",
  },
  {
    id: "legacy",
    name: "WWC Legacy Pass",
    priceInCents: 9999,
    interval: "year",
    tagline: "Ringside access, all year long.",
    features: [
      "Access to the entire library",
      "Access to live events",
      "1 general admission ticket to each of our 4 biggest events of the year",
      "One photo with your favorite wrestler per event",
      "Cancel anytime",
    ],
    highlighted: true,
    badgeLabel: "Best Value",
    stripePriceEnvVar: "STRIPE_PRICE_LEGACY",
  },
];

export function getPlanById(id: string) {
  return plans.find((p) => p.id === id);
}
