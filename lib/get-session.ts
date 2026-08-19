import { auth } from "@/auth";

// Wraps auth() so a misconfigured NEXTAUTH_SECRET (or other Auth.js runtime
// error) degrades the caller to a signed-out state instead of crashing the
// page — every page reads the session, so an unguarded throw here would take
// the entire site down rather than just the auth-gated parts.
export async function getSession() {
  try {
    return await auth();
  } catch (error) {
    // Next.js signals control flow (dynamic rendering bailout, redirect(),
    // notFound()) by throwing an error tagged with a `digest` string — those
    // must propagate untouched, or Next's routing/rendering breaks silently.
    if (error && typeof error === "object" && "digest" in error && error.digest) {
      throw error;
    }
    console.error("Failed to resolve auth session:", error);
    return null;
  }
}
