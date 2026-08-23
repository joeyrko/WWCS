"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PlanId } from "@/types";

type CheckoutPayload = { type: "subscription"; planId: PlanId };

interface CheckoutButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  payload: CheckoutPayload;
  children: React.ReactNode;
}

// Loaded once per page load, not per render — loadStripe caches internally,
// but there's no reason to call it more than once.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export function CheckoutButton({ payload, children, ...buttonProps }: CheckoutButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClick() {
    if (status === "loading") return;

    if (!session?.user) {
      const callbackUrl = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setOpen(true);
  }

  async function fetchClientSecret() {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data.clientSecret) {
      const message = data.error ?? "Checkout isn't fully configured yet.";
      toast.error(message);
      setOpen(false);
      throw new Error(message);
    }

    return data.clientSecret as string;
  }

  function handleComplete() {
    setOpen(false);
    toast.success("Payment received — your plan will be active in a moment.");
    router.refresh();
  }

  return (
    <>
      <Button onClick={handleClick} {...buttonProps}>
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Checkout</DialogTitle>
          {open && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret, onComplete: handleComplete }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
