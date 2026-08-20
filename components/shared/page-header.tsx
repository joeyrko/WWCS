import { cn } from "@/lib/utils";
import { StaggerIn } from "@/components/motion/stagger-in";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-wwc-grey-900 bg-wwc-grey-950 pb-14 pt-28 sm:pb-20 sm:pt-36",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(224,20,26,0.18),transparent)]"
      />
      <StaggerIn
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          centered && "flex flex-col items-center text-center"
        )}
      >
        {eyebrow && (
          <span className="mb-3 inline-block rounded-sm border border-wwc-red/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-wwc-red">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-wwc-grey-400">{description}</p>}
      </StaggerIn>
    </section>
  );
}
