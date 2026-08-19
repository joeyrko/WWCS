"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { NAV_LINKS } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import type { AuthNavUser } from "@/components/layout/auth-nav";

export function MobileNav({ user }: { user: AuthNavUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function goToSearch(query: string) {
    const trimmed = query?.trim();
    router.push(trimmed ? `/watch?q=${encodeURIComponent(trimmed)}` : "/watch");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="mb-8">
          <Logo />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q") as string;
            setOpen(false);
            goToSearch(q);
          }}
          className="mb-6 flex items-center gap-2 rounded-sm border border-wwc-grey-800 bg-wwc-grey-950 px-3 py-2"
        >
          <Search className="h-4 w-4 shrink-0 text-wwc-grey-500" />
          <input
            name="q"
            type="search"
            placeholder="Search…"
            aria-label="Search on-demand library"
            className="w-full bg-transparent text-sm text-wwc-white placeholder:text-wwc-grey-500 focus:outline-none"
          />
        </form>

        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-sm px-3 py-3 text-base font-semibold uppercase tracking-wide",
                    active ? "bg-wwc-red text-wwc-white" : "text-wwc-grey-300 hover:bg-wwc-grey-900"
                  )}
                >
                  {link.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-8">
          {user ? (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href="/account">My Account</Link>
                </Button>
              </SheetClose>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="primary">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
