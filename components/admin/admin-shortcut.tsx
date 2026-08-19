"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Renders nothing. Listens globally for Ctrl+Alt+A and, only for signed-in
// admins, navigates to the hidden QC dashboard at /admin. Silently does
// nothing for everyone else — the shortcut itself has no visible affordance
// anywhere in the UI, and non-admins get no reaction at all.
export function AdminShortcut() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || !event.altKey || event.key.toLowerCase() !== "a") return;

      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isTyping) return;

      if (!session?.user?.isAdmin) return;

      event.preventDefault();
      router.push("/admin");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, router]);

  return null;
}
