import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isFreeAccessActive } from "@/lib/data/settings";

// Routes reachable without an account. Everything else redirects signed-out
// visitors to sign in first — they pick a plan at /pricing once they have an
// account, then reach the rest of the site.
const PUBLIC_PATHS = new Set([
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/privacy",
  "/terms",
]);

// Reachable even by a signed-in user with no active plan — must include
// /pricing itself (otherwise there'd be no way to ever reach it).
const PLAN_EXEMPT_PATHS = new Set([...PUBLIC_PATHS, "/pricing"]);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
    const url = new URL("/sign-in", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but no active plan — block browsing the rest of the site
  // until a plan is chosen, instead of only gating individual videos/events.
  // The free-access promo (see lib/data/settings.ts, toggled from /admin)
  // lifts this specific check — everything past it still applies normally.
  if (!req.auth.user.plan && !PLAN_EXEMPT_PATHS.has(pathname) && !(await isFreeAccessActive())) {
    return NextResponse.redirect(new URL("/pricing", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Everything except API routes, Next internals, and static assets
    // (anything under mock-media/ or a file with a static extension, e.g.
    // logos and other images placed directly in public/).
    "/((?!api|_next/static|_next/image|favicon.ico|mock-media|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map)$).*)",
  ],
};
