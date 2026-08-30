import Stripe from "stripe";

// Server-only Stripe client. Never import this from a client component.
// STRIPE_SECRET_KEY is a placeholder in .env.example — replace with a real
// test-mode key (sk_test_...) to exercise Checkout end to end.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
});

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
