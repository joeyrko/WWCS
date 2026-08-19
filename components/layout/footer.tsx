import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { NAV_LINKS } from "@/lib/nav-links";

const SOCIALS = [
  { initials: "IG", label: "Instagram", href: "#" },
  { initials: "X", label: "Twitter / X", href: "#" },
  { initials: "FB", label: "Facebook", href: "#" },
  { initials: "YT", label: "YouTube", href: "#" },
];

const LEGAL_LINKS = [
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Accessibility" },
  { href: "#", label: "Do Not Sell My Info" },
];

export function Footer() {
  return (
    <footer className="border-t border-wwc-grey-900 bg-wwc-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-wwc-grey-400">
              Live pay-per-view events and the full on-demand library from World Wrestling
              Council — anytime, anywhere.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-wwc-grey-800 text-[11px] font-bold text-wwc-grey-400 transition-colors hover:border-wwc-red hover:text-wwc-red"
                >
                  {social.initials}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-wwc-grey-300">
              Navigate
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-wwc-grey-400 transition-colors hover:text-wwc-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-wwc-grey-300">
              Account
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link
                  href="/account"
                  className="text-sm text-wwc-grey-400 transition-colors hover:text-wwc-white"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-wwc-grey-400 transition-colors hover:text-wwc-white"
                >
                  Plans &amp; Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-sm text-wwc-grey-400 transition-colors hover:text-wwc-white"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-wwc-grey-300">
              Legal
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-wwc-grey-400 transition-colors hover:text-wwc-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-wwc-grey-900 pt-6 text-xs text-wwc-grey-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} World Wrestling Council. All rights reserved.</p>
          <p>WWC and all related marks are fictional, used for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
