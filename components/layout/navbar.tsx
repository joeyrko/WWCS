import { getSession } from "@/lib/get-session";
import { Logo } from "@/components/layout/logo";
import { NavLinksDesktop } from "@/components/layout/nav-links-desktop";
import { SearchBar } from "@/components/layout/search-bar";
import { AuthNav } from "@/components/layout/auth-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

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
    <header className="sticky top-0 z-40 border-b border-wwc-grey-900 bg-wwc-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinksDesktop />
        </div>
        <div className="flex items-center gap-3">
          <SearchBar />
          <AuthNav user={user} />
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
