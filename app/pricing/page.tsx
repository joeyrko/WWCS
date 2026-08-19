import { redirect } from "next/navigation";

// Plan selection now lives at "/" (the site's paywall/landing page).
// Keep this route so old links/bookmarks to /pricing still land somewhere.
export default function PricingRedirect() {
  redirect("/");
}
