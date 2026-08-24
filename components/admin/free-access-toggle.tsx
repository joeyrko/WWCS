"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function FreeAccessToggle({
  freeAccessUntil,
  active,
}: {
  freeAccessUntil: string | null;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(action: "enable" | "disable") {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/free-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        toast.error("Something went wrong updating free access.");
        return;
      }
      toast.success(
        action === "enable"
          ? "Live Event free access enabled for 24 hours."
          : "Live Event free access disabled."
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong updating free access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-wwc-grey-500">
          Free Access Promo
        </p>
        <p className="mt-1 text-sm text-white">
          {active ? (
            <>
              Active — the current Live Event is free to watch for everyone until{" "}
              {formatDate(freeAccessUntil as string, {
                weekday: undefined,
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              , then it reverts automatically. Everything else stays behind its normal access
              level.
            </>
          ) : (
            "Inactive — all content, including the Live Event, is behind its normal access level."
          )}
        </p>
      </div>
      {active ? (
        <Button variant="outline" disabled={loading} onClick={() => toggle("disable")}>
          Disable Now
        </Button>
      ) : (
        <Button disabled={loading} onClick={() => toggle("enable")}>
          Enable for 24 Hours
        </Button>
      )}
    </div>
  );
}
