import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/checkout-button";
import { getAllPlans } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare WWC+ plans and find the right way to watch every show.",
};

export default async function PricingPage() {
  const [session, plans] = await Promise.all([auth(), getAllPlans()]);
  const currentPlan = session?.user?.plan;

  return (
    <>
      <PageHeader
        eyebrow="Plans"
        title="Choose Your Plan"
        description="Every plan unlocks the WWC weekly shows. Go WWC+ for the full on-demand library and every included live event."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
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
                        {session?.user ? "Manage Account" : "Get Started Free"}
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
        </div>

        <p className="mt-10 text-center text-sm text-wwc-grey-500">
          Prices in USD. Cancel your subscription anytime from your account dashboard. PPV events
          not included in your plan can always be purchased individually.
        </p>
      </section>
    </>
  );
}
