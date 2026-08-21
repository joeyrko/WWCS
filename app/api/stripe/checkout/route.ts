import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { stripe, getBaseUrl } from "@/lib/stripe";
import { getPlanById } from "@/lib/data/plans";
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

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: session.user.email ?? undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/account?checkout=success`,
        cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
        metadata: { userId: session.user.id, planId: plan.id },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    return NextResponse.json({ error: "Invalid checkout type." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
