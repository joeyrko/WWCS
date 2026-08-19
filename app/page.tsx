import type { Metadata } from "next";
import Link from "next/link";
import { Check, PlayCircle } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/checkout-button";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { StaggerIn } from "@/components/motion/stagger-in";
import { getAllPlans } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description:
    "Every WWC live pay-per-view event and the full on-demand library. Choose a plan, sign up free, or log in to start watching.",
};

export default async function GatePage() {
  const [session, plans] = await Promise.all([getSession(), getAllPlans()]);
  const currentPlan = session?.user?.plan;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(224,20,26,0.24),transparent)]"
      />
      <div className="clip-diagonal absolute inset-x-0 top-0 -z-20 h-[70vh] bg-gradient-to-br from-wwc-red-dark/25 via-wwc-black to-wwc-black" />

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
        <StaggerIn>
          <span className="mb-4 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
            WWC+ Streaming
          </span>
          <h1 className="text-gradient-red font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl">
            Every Fight. Every Show.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-wwc-grey-300">
            Live pay-per-view events and the full on-demand library from World Wrestling
            Council — anytime, anywhere. Pick a plan to get started.
          </p>

          {session?.user ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/events" className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" /> Enter WWC+
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/watch">Browse On-Demand</Link>
              </Button>
            </div>
          ) : (
            <p className="mt-8 text-sm text-wwc-grey-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-wwc-red hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </StaggerIn>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-md border p-7",
                  plan.highlighted
                    ? "border-wwc-red bg-wwc-grey-950 shadow-[0_0_40px_rgba(224,20,26,0.15)]"
                    : "border-wwc-grey-800 bg-wwc-grey-950/60"
                )}
              >
                {plan.highlighted && (
                  <span className="mb-3 w-fit rounded-sm bg-wwc-red px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                )}
                <h2 className="font-display text-2xl uppercase tracking-wide text-white">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-wwc-grey-400">{plan.tagline}</p>
                <p className="mt-5 font-display text-5xl text-white">
                  ${(plan.priceInCents / 100).toFixed(2)}
                  {plan.interval && (
                    <span className="ml-1 text-base font-sans font-normal text-wwc-grey-500">
                      /{plan.interval}
                    </span>
                  )}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-wwc-grey-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-wwc-red" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button asChild variant={plan.highlighted ? "primary" : "outline"} className="w-full">
                      <Link href={session?.user ? "/account" : "/sign-up"}>
                        {session?.user ? "Manage Account" : "Sign Up Free"}
                      </Link>
                    </Button>
                  ) : (
                    <CheckoutButton
                      payload={{ type: "subscription", planId: plan.id }}
                      variant={plan.highlighted ? "primary" : "outline"}
                      className="w-full"
                    >
                      Choose {plan.name}
                    </CheckoutButton>
                  )}
                </div>
              </div>
            );
          })}
        </StaggerGrid>

        <p className="mt-10 text-center text-sm text-wwc-grey-500">
          Prices in USD. Cancel your subscription anytime from your account dashboard. PPV events
          not included in your plan can always be purchased individually.
        </p>
      </section>
    </div>
  );
}
