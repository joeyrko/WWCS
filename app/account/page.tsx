import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { stripe } from "@/lib/stripe";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "@/components/account/manage-billing-button";
import { getPlanById } from "@/lib/data/plans";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_session_id?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  const { checkout_session_id } = await searchParams;
  const [plan, checkoutStatus] = await Promise.all([
    getPlanById(session.user.plan),
    checkout_session_id ? getCheckoutStatus(checkout_session_id) : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="My Account"
        description={`Signed in as ${session.user.email}`}
      />

      {checkoutStatus === "complete" && (
        <div className="mx-auto mt-6 flex max-w-4xl items-center gap-2 rounded-sm border border-wwc-red/40 bg-wwc-red/10 px-4 py-3 text-sm font-semibold text-white sm:px-6 lg:px-8">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-wwc-red" />
          Payment received — your plan is now active.
        </div>
      )}
      {checkoutStatus === "open" && (
        <div className="mx-auto mt-6 flex max-w-4xl items-center gap-2 rounded-sm border border-wwc-grey-800 bg-wwc-grey-950 px-4 py-3 text-sm font-semibold text-wwc-grey-300 sm:px-6 lg:px-8">
          <Clock className="h-5 w-5 shrink-0" />
          Checkout wasn&apos;t completed. You can try again from Pricing anytime.
        </div>
      )}

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-wwc-grey-500">
                Current Plan
              </p>
              <p className="mt-1 font-display text-2xl uppercase tracking-wide text-white">
                {plan?.name ?? "No Active Plan"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/pricing">{plan ? "Change Plan" : "Choose a Plan"}</Link>
              </Button>
              {plan && <ManageBillingButton />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Best-effort status check for the banner above — the webhook (not this) is
// what actually grants the plan, so a failed/invalid session id here just
// means no banner shows rather than a broken page.
async function getCheckoutStatus(sessionId: string): Promise<"complete" | "open" | null> {
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    return checkoutSession.status === "complete" ? "complete" : "open";
  } catch {
    return null;
  }
}
