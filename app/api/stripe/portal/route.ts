import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { getBaseUrl, stripe } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/data/users";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const customerId = await getStripeCustomerId(session.user.id);
  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account found yet — this shows up after your first completed checkout." },
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
