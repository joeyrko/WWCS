import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/checkout-button";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { getAllPlans } from "@/lib/data/plans";
import { isTvApp } from "@/lib/tv-app";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Every WWC live pay-per-view event and the full on-demand library. Choose a plan to start watching.",
};

export default async function PricingPage() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in?callbackUrl=/pricing");
  if (session.user.plan) redirect("/events");

  const [plans, tvApp] = await Promise.all([getAllPlans(), isTvApp()]);
  const currentPlan = session.user.plan;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,56,240,0.24),transparent)]"
      />
      <div className="clip-diagonal absolute inset-x-0 top-0 -z-20 h-[60vh] bg-gradient-to-br from-wwc-red-dark/25 via-wwc-black to-wwc-black" />

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-md border p-7",
                  plan.highlighted
                    ? "border-wwc-red bg-wwc-grey-950 pb-24 shadow-[0_0_40px_rgba(0,56,240,0.15)]"
                    : "border-wwc-grey-800 bg-wwc-grey-950/60"
                )}
              >
                {plan.highlighted && (
                  <span className="mb-3 w-fit rounded-sm bg-wwc-red px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {plan.badgeLabel ?? "Most Popular"}
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

                {plan.highlighted ? (
                  <div className="absolute inset-x-0 bottom-0 rounded-b-md bg-gradient-to-t from-wwc-grey-950 via-wwc-grey-950/95 to-transparent px-7 pb-7 pt-10">
                    <PlanAction plan={plan} isCurrent={isCurrent} tvApp={tvApp} variant="primary" />
                  </div>
                ) : (
                  <div className="mt-7">
                    <PlanAction plan={plan} isCurrent={isCurrent} tvApp={tvApp} variant="outline" />
                  </div>
                )}
              </div>
            );
          })}
        </StaggerGrid>

        <p className="mt-10 text-center text-sm text-wwc-grey-500">
          Prices in USD. Cancel your subscription anytime from your account dashboard. No refunds
          are issued; your plan will remain active until the established end date.
        </p>
      </section>
    </div>
  );
}

function PlanAction({
  plan,
  isCurrent,
  tvApp,
  variant,
}: {
  plan: Plan;
  isCurrent: boolean;
  tvApp: boolean;
  variant: "primary" | "outline";
}) {
  if (isCurrent) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Current Plan
      </Button>
    );
  }

  // TV app storefronts (Fire TV, LG, Samsung) require digital subscriptions
  // to go through their own in-app purchasing, not a checkout embedded in
  // the app — so point users to subscribe from a browser instead.
  if (tvApp) {
    return (
      <p className="text-center text-sm text-wwc-grey-400">
        Subscribe at <span className="font-semibold text-white">wwcnow.com</span> from your
        phone or computer.
      </p>
    );
  }

  return (
    <CheckoutButton
      payload={{ type: "subscription", planId: plan.id }}
      variant={variant}
      className={cn("w-full", variant === "primary" && "shadow-lg shadow-black/40")}
    >
      Choose {plan.name}
    </CheckoutButton>
  );
}
