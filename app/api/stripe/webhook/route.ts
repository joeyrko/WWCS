import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { addOrder, updateUserPlan } from "@/lib/data/users";
import type { PlanId } from "@/types";

// Configure this endpoint in the Stripe CLI or Dashboard:
//   stripe listen --forward-to localhost:3000/api/stripe/webhook
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe signature or STRIPE_WEBHOOK_SECRET." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, planId } = session.metadata ?? {};

    if (userId && planId) {
      const customerId = typeof session.customer === "string" ? session.customer : undefined;
      await updateUserPlan(userId, planId as PlanId, customerId);
      await addOrder({
        id: session.id,
        userId,
        type: "subscription",
        label: `Subscription — ${planId}`,
        amountInCents: session.amount_total ?? 0,
        createdAt: new Date().toISOString(),
        status: "paid",
      });
    }
  }

  return NextResponse.json({ received: true });
}
