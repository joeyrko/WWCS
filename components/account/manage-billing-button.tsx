"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

export function ManageBillingButton(props: Omit<ButtonProps, "onClick" | "children">) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Billing portal isn't configured yet.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong opening the billing portal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} {...props}>
      {loading ? "Opening…" : "Manage Billing"}
    </Button>
  );
}
