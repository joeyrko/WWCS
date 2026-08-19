import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <Image
        src="/wwc-logo.png"
        alt="WWC+"
        width={36}
        height={40}
        priority
        className="h-9 w-auto shrink-0 transition-transform duration-200 group-hover:scale-105"
      />
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-wwc-grey-400 sm:block">
        World Wrestling Council
      </span>
    </Link>
  );
}
