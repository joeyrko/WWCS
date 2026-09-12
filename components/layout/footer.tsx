import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-wwc-grey-900 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-sm text-wwc-grey-500 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <p className="sm:text-left">&copy; {new Date().getFullYear()} World Wrestling Council. All rights reserved.</p>
        <a
          href="https://instagram.com/CyberJavy"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-wwc-white"
        >
          Created by Javier Perez (@CyberJavy)
        </a>
        <div className="flex items-center gap-4 sm:justify-end">
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
