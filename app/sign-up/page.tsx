import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free WWC account to start watching.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, session] = await Promise.all([searchParams, getSession()]);
  if (session?.user) redirect(callbackUrl ?? "/events");

  return (
    <AuthCard title="Create Account" subtitle="Join WWC for free — upgrade to WWC+ anytime.">
      <SignUpForm callbackUrl={callbackUrl ?? "/events"} />
    </AuthCard>
  );
}
