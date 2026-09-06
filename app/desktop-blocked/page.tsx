import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Our App",
  robots: { index: false, follow: false },
};

export default function DesktopBlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-wwc-black px-4 text-center">
      <span className="mb-4 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
        WWC+
      </span>
      <h1 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
        Please Use Our App
      </h1>
      <p className="mt-4 max-w-md text-wwc-grey-400">
        The desktop site is temporarily unavailable. WWC+ is currently only accessible from
        your phone, tablet, or smart TV app.
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
