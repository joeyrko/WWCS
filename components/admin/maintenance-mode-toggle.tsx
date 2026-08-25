"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MaintenanceModeToggle({ active }: { active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(action: "enable" | "disable") {
    if (
      action === "enable" &&
      !window.confirm(
        "This blocks the entire site — every visitor except an admin will be redirected to a maintenance page, including anyone trying to check out. Continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        toast.error("Something went wrong updating maintenance mode.");
        return;
      }
      toast.success(action === "enable" ? "Maintenance mode enabled." : "Maintenance mode disabled.");
      router.refresh();
    } catch {
      toast.error("Something went wrong updating maintenance mode.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-md border p-5 ${
        active ? "border-wwc-red bg-wwc-red/10" : "border-wwc-grey-800 bg-wwc-grey-950"
      }`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-wwc-grey-500">
          Maintenance Mode
        </p>
        <p className="mt-1 text-sm text-white">
          {active
            ? "Active — the entire site is blocked for everyone except admins. No one can sign up, sign in, browse, or check out."
            : "Inactive — the site is live and open to everyone as normal."}
        </p>
      </div>
      {active ? (
        <Button variant="outline" disabled={loading} onClick={() => toggle("disable")}>
          Disable Now
        </Button>
      ) : (
        <Button variant="outline" disabled={loading} onClick={() => toggle("enable")}>
          Enable Maintenance Mode
        </Button>
      )}
    </div>
  );
}
