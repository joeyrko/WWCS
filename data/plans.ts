import type { Plan } from "@/types";

// Every plan here is paid — there is no free tier and no free access to
// gated content. A signed-up account with no plan (plan: null) grants no
// library/event access; it's purely a placeholder until a plan is purchased.
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
      "One general admission ticket to each of our two biggest events of the year — a $40 value",
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

// Maps a Stripe Price ID back to our plan — used by the webhook to figure
// out which plan an invoice/subscription event refers to.
export function getPlanByStripePriceId(priceId: string) {
  return plans.find((p) => p.stripePriceEnvVar && process.env[p.stripePriceEnvVar] === priceId);
}
