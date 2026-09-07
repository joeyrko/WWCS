"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GeoFenceToggle({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(action: "enable" | "disable") {
    if (
      action === "disable" &&
      !window.confirm(
        "This turns off the Puerto Rico broadcast blackout — live events become visible to everyone there until you turn it back on. Continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/geo-fence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        toast.error("Something went wrong updating the geo-fence.");
        return;
      }
      toast.success(action === "disable" ? "Geo-fence disabled." : "Geo-fence enabled.");
      router.refresh();
    } catch {
      toast.error("Something went wrong updating the geo-fence.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-md border p-5 ${
        disabled ? "border-wwc-red bg-wwc-red/10" : "border-wwc-grey-800 bg-wwc-grey-950"
      }`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-wwc-grey-500">
          Puerto Rico Geo-Fence
        </p>
        <p className="mt-1 text-sm text-white">
          {disabled
            ? "Disabled — live events are visible to everyone in Puerto Rico right now."
            : "Active — live events are blacked out for visitors in Puerto Rico due to broadcast restrictions."}
        </p>
      </div>
      {disabled ? (
        <Button variant="outline" disabled={loading} onClick={() => toggle("enable")}>
          Enable Geo-Fence
        </Button>
      ) : (
        <Button variant="outline" disabled={loading} onClick={() => toggle("disable")}>
          Disable Geo-Fence
        </Button>
      )}
    </div>
  );
}
