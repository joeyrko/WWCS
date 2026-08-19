"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

export function NavLinksDesktop() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-3.5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
              active ? "text-wwc-white" : "text-wwc-grey-400 hover:text-wwc-white"
            )}
          >
            {link.label}
            {active && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-wwc-red" />}
          </Link>
        );
      })}
    </nav>
  );
}
