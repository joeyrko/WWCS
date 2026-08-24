import { headers } from "next/headers";

// TV platform storefronts (Fire TV/Amazon Appstore, LG Content Store, Samsung
// Seller Office) reject apps that let users buy digital subscriptions through
// anything other than the platform's own in-app purchasing — a Stripe
// checkout opened inside our WebView wrapper counts as bypassing that. Each
// native wrapper app sets this marker in its WebView's User-Agent so the
// site can hide checkout entirely in that context and point users to
// subscribe from a browser instead, the same pattern Netflix/Hulu use on TV
// apps.
const TV_APP_USER_AGENT_MARKER = "WWCTVApp";

export async function isTvApp(): Promise<boolean> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  return userAgent.includes(TV_APP_USER_AGENT_MARKER);
}
