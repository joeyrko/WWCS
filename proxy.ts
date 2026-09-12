import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  FREE_ACCESS_PROMO_SLUG,
  isFreeAccessActive,
  isMaintenanceModeActive,
  isDesktopBlockActive,
} from "@/lib/data/settings";
import { isDesktopUserAgent } from "@/lib/is-desktop-user-agent";

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
  "/maintenance",
  "/desktop-blocked",
]);

// Reachable even by a signed-in user with no active plan — must include
// /pricing itself (otherwise there'd be no way to ever reach it).
const PLAN_EXEMPT_PATHS = new Set([...PUBLIC_PATHS, "/pricing"]);

// Reachable by anyone even while maintenance mode is on (see
// lib/data/settings.ts, toggled from /admin) — /sign-in has to stay open so
// an admin can actually get in and turn it back off; the rest are low-risk
// legal/technical pages, harmless to leave public. Everything else,
// including /pricing and checkout, redirects to /maintenance for anyone who
// isn't already signed in as an admin. Also includes /desktop-blocked — if
// the desktop block is ever on at the same time, that page has to stay
// reachable too, or a desktop visitor would bounce between the two checks
// forever (each one redirecting to the page the other just blocked).
const MAINTENANCE_ALLOWED_PATHS = new Set([
  "/maintenance",
  "/desktop-blocked",
  "/sign-in",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

// Reachable by a desktop browser even while the desktop block is on (see
// lib/data/settings.ts, toggled from /admin) — /sign-in has to stay open so
// an admin can sign in from a desktop and turn it back off; the rest are
// low-risk legal/technical pages. Everything else redirects desktop browsers
// to /desktop-blocked; phone/tablet browsers and the TV app are unaffected.
// Also includes /maintenance — see the same note above, mirrored so this
// check can't loop against that one either.
const DESKTOP_BLOCK_ALLOWED_PATHS = new Set([
  "/desktop-blocked",
  "/maintenance",
  "/sign-in",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

// The free-access promo (see lib/data/settings.ts, toggled from /admin)
// only ever unlocks this one video — everywhere else on the site stays
// behind the normal plan check below. /events (Home) is included too,
// purely so a no-plan visitor has somewhere to actually see and click the
// Live card in the first place — every other link on that page still gates
// normally on click, since only these exact paths bypass the check.
const FREE_ACCESS_PROMO_PATHS = new Set([
  "/events",
  `/events/${FREE_ACCESS_PROMO_SLUG}`,
  `/watch/${FREE_ACCESS_PROMO_SLUG}`,
]);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (
    !MAINTENANCE_ALLOWED_PATHS.has(pathname) &&
    req.auth?.user?.isAdmin !== true &&
    (await isMaintenanceModeActive())
  ) {
    return NextResponse.redirect(new URL("/maintenance", req.nextUrl.origin));
  }

  if (
    !DESKTOP_BLOCK_ALLOWED_PATHS.has(pathname) &&
    req.auth?.user?.isAdmin !== true &&
    isDesktopUserAgent(req.headers.get("user-agent")) &&
    (await isDesktopBlockActive())
  ) {
    return NextResponse.redirect(new URL("/desktop-blocked", req.nextUrl.origin));
  }

  if (!req.auth) {
    if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
    const url = new URL("/sign-in", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but no active plan — block browsing the rest of the site
  // until a plan is chosen, instead of only gating individual videos/events.
  if (!req.auth.user.plan && !PLAN_EXEMPT_PATHS.has(pathname)) {
    const promoActive = FREE_ACCESS_PROMO_PATHS.has(pathname) && (await isFreeAccessActive());
    if (!promoActive) {
      return NextResponse.redirect(new URL("/pricing", req.nextUrl.origin));
    }
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
