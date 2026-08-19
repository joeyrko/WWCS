import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Routes reachable without an account. Everything else redirects signed-out
// visitors to "/" — the plan-selection/paywall page — where they can pick a
// plan and pay, sign up free, or log in before reaching the rest of the site.
const PUBLIC_PATHS = new Set(["/", "/sign-in", "/sign-up"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (req.auth || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const url = new URL("/", req.nextUrl.origin);
  return NextResponse.redirect(url);
});

export const config = {
  matcher: [
    // Everything except API routes, Next internals, and static assets
    // (anything under mock-media/ or a file with a static extension, e.g.
    // logos and other images placed directly in public/).
    "/((?!api|_next/static|_next/image|favicon.ico|mock-media|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map)$).*)",
  ],
};
