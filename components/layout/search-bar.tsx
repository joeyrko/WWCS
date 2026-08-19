"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/watch?q=${encodeURIComponent(trimmed)}` : "/watch");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "hidden items-center gap-2 rounded-sm border border-wwc-grey-800 bg-wwc-grey-950 px-3 py-2 transition-colors focus-within:border-wwc-red lg:flex",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-wwc-grey-500" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search shows, wrestlers…"
        aria-label="Search on-demand library"
        className="w-40 bg-transparent text-sm text-wwc-white placeholder:text-wwc-grey-500 focus:outline-none"
      />
    </form>
  );
}
