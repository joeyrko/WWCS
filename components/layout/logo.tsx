import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-wwc-red font-display text-lg text-wwc-white transition-transform duration-200 group-hover:scale-105">
        W
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-wide text-wwc-white">WWC</span>
        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-wwc-grey-400 sm:block">
          World Wrestling Council
        </span>
      </span>
    </Link>
  );
}
