import { getSession } from "@/lib/get-session";
import { Logo } from "@/components/layout/logo";
import { NavLinksDesktop } from "@/components/layout/nav-links-desktop";
import { SearchBar } from "@/components/layout/search-bar";
import { AuthNav } from "@/components/layout/auth-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavbarShell } from "@/components/layout/navbar-shell";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        plan: session.user.plan,
      }
    : null;

  return (
    <NavbarShell>
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <NavLinksDesktop between={<SearchBar className="mx-1" />} />
        <div className="flex items-center justify-end gap-3">
          <AuthNav user={user} />
          <MobileNav user={user} />
        </div>
      </div>
    </NavbarShell>
  );
}
