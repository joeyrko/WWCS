import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceInCents: 0,
    interval: null,
    tagline: "Get in the door.",
    features: [
      "Weekly show highlights",
      "Select free full matches",
      "News & roster profiles",
      "Ad-supported",
    ],
  },
  {
    id: "monthly",
    name: "WWC+ Monthly",
    priceInCents: 999,
    interval: "month",
    tagline: "Every show. Every month.",
    features: [
      "Full on-demand video library",
      "Included live PPV events",
      "Ad-free viewing",
      "Watch on any device",
      "Cancel anytime",
    ],
    highlighted: true,
    stripePriceEnvVar: "STRIPE_PRICE_MONTHLY",
  },
  {
    id: "annual",
    name: "WWC+ Annual",
    priceInCents: 8999,
    interval: "year",
    tagline: "Best value for the diehard.",
    features: [
      "Everything in WWC+ Monthly",
      "Save 25% vs. paying monthly",
      "Early access to live event tickets",
      "Annual member badge",
      "Cancel anytime",
    ],
    stripePriceEnvVar: "STRIPE_PRICE_ANNUAL",
  },
];

export function getPlanById(id: string) {
  return plans.find((p) => p.id === id);
}
