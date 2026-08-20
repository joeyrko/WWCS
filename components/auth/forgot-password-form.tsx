"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Unable to process that request.");
        return;
      }

      setResetUrl(data.resetUrl);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (resetUrl) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-sm border border-wwc-red/40 bg-wwc-red/10 p-4 text-sm">
          <p className="font-semibold text-white">This is a demo — no email was actually sent.</p>
          <p className="mt-1 text-wwc-grey-300">Use this link to reset your password:</p>
          <Link
            href={resetUrl}
            className="mt-2 block break-all font-semibold text-wwc-red hover:underline"
          >
            {resetUrl}
          </Link>
        </div>
        <p className="text-center text-sm text-wwc-grey-500">
          <Link href="/sign-in" className="font-semibold text-wwc-red hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="fan@wwc.tv" />
      </div>
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Sending…" : "Send Reset Link"}
      </Button>
      <p className="mt-2 text-center text-sm text-wwc-grey-500">
        Remembered your password?{" "}
        <Link href="/sign-in" className="font-semibold text-wwc-red hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
