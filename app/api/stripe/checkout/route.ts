import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { stripe, getBaseUrl } from "@/lib/stripe";
import { getPlanById } from "@/lib/data/plans";
import { getStripeCustomerId } from "@/lib/data/users";
import type { PlanId } from "@/types";

interface SubscriptionCheckoutBody {
  type: "subscription";
  planId: PlanId;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SubscriptionCheckoutBody | null;

  if (!body?.type) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const baseUrl = getBaseUrl();

  try {
    if (body.type === "subscription") {
      const plan = await getPlanById(body.planId);
      if (!plan || !plan.stripePriceEnvVar) {
        return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
      }
      const priceId = process.env[plan.stripePriceEnvVar];
      if (!priceId) {
        return NextResponse.json(
          {
            error: `Stripe price not configured. Set ${plan.stripePriceEnvVar} in .env.local.`,
          },
          { status: 500 }
        );
      }

      // Reuse the existing Stripe Customer if this user already has one
      // (e.g. re-subscribing after a lapsed plan) instead of letting
      // Checkout mint a new one each time — customer and customer_email
      // are mutually exclusive on the session.
      const existingCustomerId = await getStripeCustomerId(session.user.id);

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        ui_mode: "embedded_page",
        // Cards (the common case) complete in place with no page navigation
        // at all — the widget just closes. Payment methods that inherently
        // need an external redirect (e.g. bank auth pages) still get one;
        // that's unavoidable, not a choice this app makes.
        redirect_on_completion: "if_required",
        ...(existingCustomerId
          ? { customer: existingCustomerId }
          : { customer_email: session.user.email ?? undefined }),
        line_items: [{ price: priceId, quantity: 1 }],
        return_url: `${baseUrl}/account?checkout_session_id={CHECKOUT_SESSION_ID}`,
        metadata: { userId: session.user.id, planId: plan.id },
      });

      return NextResponse.json({ clientSecret: checkoutSession.client_secret });
    }

    return NextResponse.json({ error: "Invalid checkout type." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
