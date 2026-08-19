"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Netflix-style nav: transparent (blends into whatever hero/gradient sits
// behind it) at the top of the page, fades to a solid blurred bar once the
// user scrolls, so content never gets lost underneath a see-through header.
export function NavbarShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-300",
        scrolled
          ? "border-b border-wwc-grey-900 bg-wwc-black/95 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-black/70 via-black/25 to-transparent"
      )}
    >
      {children}
    </header>
  );
}
