import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { Reveal } from "@/components/motion/reveal";
import { getAllPlans } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

export async function PlansTeaser() {
  const plans = await getAllPlans();

  return (
    <section className="relative overflow-hidden border-y border-wwc-grey-900 bg-wwc-grey-950 py-20">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(224,20,26,0.14),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
            One Membership. Every Show.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-wwc-grey-400">
            Join WWC+ for the full on-demand library and every included live event — or pay only
            for the PPVs you want.
          </p>
        </Reveal>

        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-md border p-6",
                plan.highlighted
                  ? "border-wwc-red bg-wwc-black shadow-[0_0_40px_rgba(224,20,26,0.15)]"
                  : "border-wwc-grey-800 bg-wwc-black/60"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 w-fit rounded-sm bg-wwc-red px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-wwc-grey-400">{plan.tagline}</p>
              <p className="mt-4 font-display text-4xl text-white">
                ${(plan.priceInCents / 100).toFixed(2)}
                {plan.interval && (
                  <span className="ml-1 text-sm font-sans font-normal text-wwc-grey-500">
                    /{plan.interval}
                  </span>
                )}
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-wwc-grey-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-wwc-red" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.highlighted ? "primary" : "outline"}
                className="mt-6 w-full"
              >
                <Link href="/pricing">
                  {plan.id === "free" ? "Get Started Free" : "Choose Plan"}
                </Link>
              </Button>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
