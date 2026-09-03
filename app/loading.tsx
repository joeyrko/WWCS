import Image from "next/image";

// Next.js swaps this in automatically as the Suspense fallback for any route
// segment that suspends (e.g. a page awaiting a Supabase fetch) — no manual
// wiring needed per page. See app/*/page.tsx for the async fetches that
// trigger it.
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-wwc-grey-700 border-t-wwc-red" />
        <Image
          src="/wwc-logo.png"
          alt="WWC+"
          width={680}
          height={738}
          priority
          className="h-10 w-auto"
        />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wwc-grey-400">
        Loading
      </p>
    </div>
  );
}
