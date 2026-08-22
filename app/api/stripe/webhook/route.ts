import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { addOrder, clearUserPlan, findUserByStripeCustomerId, updateUserPlan } from "@/lib/data/users";
import { getPlanByStripePriceId } from "@/data/plans";
import type { PlanId } from "@/types";

// Configure this endpoint in the Stripe CLI or Dashboard:
//   stripe listen --forward-to localhost:3000/api/stripe/webhook
// Enabled events: checkout.session.completed, invoice.paid,
// customer.subscription.updated, customer.subscription.deleted.
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

  switch (event.type) {
    case "checkout.session.completed": {
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
      break;
    }

    // Fires on every billing-cycle renewal too, not just the first invoice —
    // billing_reason filters out that first one, since checkout.session.completed
    // already handled it (using the invoice id here as well would double it up).
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== "subscription_cycle") break;

      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      if (!customerId) break;

      const user = await findUserByStripeCustomerId(customerId);
      if (!user) break;

      const priceId = invoice.lines.data[0]?.pricing?.price_details?.price;
      const priceIdStr = typeof priceId === "string" ? priceId : priceId?.id;
      const plan = priceIdStr ? getPlanByStripePriceId(priceIdStr) : undefined;
      const planId = plan?.id ?? user.plan;
      if (!planId) break;

      await updateUserPlan(user.id, planId);
      await addOrder({
        id: invoice.id ?? `inv_${Date.now()}`,
        userId: user.id,
        type: "subscription",
        label: `Subscription renewal — ${planId}`,
        amountInCents: invoice.amount_paid,
        createdAt: new Date().toISOString(),
        status: "paid",
      });
      break;
    }

    // A plan change (upgrade/downgrade) via the billing portal — sync our
    // stored plan to whatever price the subscription now points to.
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
      if (!customerId) break;

      const user = await findUserByStripeCustomerId(customerId);
      if (!user) break;

      if (subscription.status === "canceled" || subscription.status === "unpaid") {
        await clearUserPlan(user.id);
        break;
      }

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = priceId ? getPlanByStripePriceId(priceId) : undefined;
      if (plan && plan.id !== user.plan) {
        await updateUserPlan(user.id, plan.id);
      }
      break;
    }

    // The subscription has fully ended (cancellation reached the end of the
    // billing period, or was canceled immediately) — cut off access now.
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
      if (!customerId) break;

      const user = await findUserByStripeCustomerId(customerId);
      if (user) await clearUserPlan(user.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
