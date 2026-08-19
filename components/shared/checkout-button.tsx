"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { PlanId } from "@/types";

type CheckoutPayload =
  | { type: "subscription"; planId: PlanId }
  | { type: "ppv"; eventSlug: string };

interface CheckoutButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  payload: CheckoutPayload;
  children: React.ReactNode;
}

export function CheckoutButton({ payload, children, ...buttonProps }: CheckoutButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (status === "loading" || loading) return;

    if (!session?.user) {
      const callbackUrl = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Checkout isn't fully configured yet.", {
          description: "Add real Stripe test-mode keys and price IDs to .env.local to go live.",
        });
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} {...buttonProps}>
      {loading ? "Redirecting…" : children}
    </Button>
  );
}
