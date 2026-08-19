import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your WWC account to watch live events and the on-demand library.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthCard title="Sign In" subtitle="Welcome back. Let's get you ringside.">
      <SignInForm callbackUrl={callbackUrl ?? "/account"} />
    </AuthCard>
  );
}
