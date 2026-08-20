"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export interface FiltersState {
  q: string;
  type: string;
  wrestler: string;
  sort: string;
}

export function FiltersBar({ current }: { current: FiltersState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(current.q);

  function navigate(next: Partial<FiltersState>) {
    const merged = { ...current, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.type && merged.type !== "all") params.set("type", merged.type);
    if (merged.wrestler && merged.wrestler !== "all") params.set("wrestler", merged.wrestler);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: query });
        }}
        className="flex w-full items-center gap-2 rounded-sm border border-wwc-grey-800 bg-wwc-grey-950 px-3 py-2 sm:w-72"
      >
        <Search className="h-4 w-4 shrink-0 text-wwc-grey-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles…"
          aria-label="Search video titles"
          className="w-full bg-transparent text-sm text-white placeholder:text-wwc-grey-500 focus:outline-none"
        />
      </form>
    </div>
  );
}
