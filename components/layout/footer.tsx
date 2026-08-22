import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-wwc-grey-900 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-sm text-wwc-grey-500 sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p>&copy; {new Date().getFullYear()} World Wrestling Council. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-wwc-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-wwc-white">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
