import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { getBaseUrl, stripe } from "@/lib/stripe";

// Scaffolded billing portal route. In production, store the Stripe customer ID
// on the user record when their first Checkout session completes, then read it
// here instead of relying on an env placeholder.
export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const customerId = process.env.STRIPE_MOCK_CUSTOMER_ID;
  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "No Stripe customer configured for this mock account. Set STRIPE_MOCK_CUSTOMER_ID once you have a real test-mode customer.",
      },
      { status: 400 }
    );
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getBaseUrl()}/account`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
