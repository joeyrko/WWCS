"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Unable to create account.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      setLoading(false);

      if (!signInRes || signInRes.error) {
        toast.error("Account created — please sign in.");
        router.push("/sign-in");
        return;
      }

      toast.success("Welcome to WWC+.");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" type="text" required placeholder="Alex Fan" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Creating Account…" : "Create Account"}
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
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-wwc-red hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
