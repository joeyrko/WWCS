"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back.");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="fan@wwc.tv" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-semibold text-wwc-red hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required placeholder="••••••••" />
      </div>
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Signing In…" : "Sign In"}
      </Button>

      <div className="my-1 flex items-center gap-3 text-xs uppercase tracking-wide text-wwc-grey-600">
        <span className="h-px flex-1 bg-wwc-grey-800" /> or{" "}
        <span className="h-px flex-1 bg-wwc-grey-800" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={googleLoading}
        onClick={() => {
          setGoogleLoading(true);
          signIn("google", { callbackUrl });
        }}
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>

      <p className="mt-2 text-center text-sm text-wwc-grey-500">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-wwc-red hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-4 rounded-sm border border-wwc-grey-800 bg-wwc-black p-3 text-xs text-wwc-grey-500">
        <p className="mb-1 font-semibold text-wwc-grey-300">Demo accounts</p>
        <p>fan@wwc.tv / wrestlemania — WWC+ Annual</p>
        <p>champion@wwc.tv / championship — WWC Legacy Pass</p>
        <p>rookie@wwc.tv / firstmatch — No active plan</p>
      </div>
    </form>
  );
}
