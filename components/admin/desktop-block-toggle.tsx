"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DesktopBlockToggle({ active }: { active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(action: "enable" | "disable") {
    if (
      action === "enable" &&
      !window.confirm(
        "This blocks desktop browsers site-wide — only phone/tablet browsers and the TV app will get through. It's a User-Agent check, not real device verification. Continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/desktop-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        toast.error("Something went wrong updating the desktop block.");
        return;
      }
      toast.success(action === "enable" ? "Desktop access blocked." : "Desktop access restored.");
      router.refresh();
    } catch {
      toast.error("Something went wrong updating the desktop block.");
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
          Desktop Access
        </p>
        <p className="mt-1 text-sm text-white">
          {active
            ? "Blocked — desktop browsers are redirected to a \"use our app\" page. Phone/tablet browsers and the TV app work normally."
            : "Open — the desktop site is accessible to everyone as normal."}
        </p>
      </div>
      {active ? (
        <Button variant="outline" disabled={loading} onClick={() => toggle("disable")}>
          Unblock Desktop
        </Button>
      ) : (
        <Button variant="outline" disabled={loading} onClick={() => toggle("enable")}>
          Block Desktop
        </Button>
      )}
    </div>
  );
}
