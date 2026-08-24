import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { FREE_ACCESS_PROMO_SLUG, isFreeAccessActive } from "@/lib/data/settings";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your WWC account, then choose a plan to start watching.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, session, freeAccessActive] = await Promise.all([
    searchParams,
    getSession(),
    isFreeAccessActive(),
  ]);
  // No explicit callbackUrl means this wasn't a redirect from some other
  // gated page — default to the free live event while the promo's running,
  // so signing up/in takes you straight there instead of to /pricing.
  const defaultCallbackUrl = freeAccessActive ? `/events/${FREE_ACCESS_PROMO_SLUG}` : "/pricing";

  if (session?.user) redirect(callbackUrl ?? defaultCallbackUrl);

  return (
    <AuthCard title="Create Account" subtitle="Create your account, then choose a plan to get in.">
      <SignUpForm callbackUrl={callbackUrl ?? defaultCallbackUrl} />
    </AuthCard>
  );
}
