import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon!",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-wwc-black px-4 text-center">
      <span className="mb-4 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
        WWC+
      </span>
      <h1 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
        Coming Soon!
      </h1>
      <p className="mt-4 max-w-md text-wwc-grey-400">
        WWC+ isn&apos;t open yet — we&apos;re still uploading content and getting everything
        ready. Please don&apos;t attempt to sign up or subscribe until we&apos;re live.
      </p>
      <p className="mt-6 text-sm text-wwc-grey-500">
        Questions?{" "}
        <a
          href="mailto:support@worldwrestlingcouncil.com"
          className="text-wwc-red hover:underline"
        >
          support@worldwrestlingcouncil.com
        </a>
      </p>
    </div>
  );
}
