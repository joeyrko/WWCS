import { Logo } from "@/components/layout/logo";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,56,240,0.16),transparent)]"
      />
      <div className="w-full max-w-md rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-8 shadow-2xl shadow-black/40">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-3xl uppercase tracking-wide text-white">
          {title}
        </h1>
        <p className="mt-1.5 text-center text-sm text-wwc-grey-400">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
