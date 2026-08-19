"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SHOW_TYPES = [
  { value: "all", label: "All Shows" },
  { value: "ppv", label: "PPV Replays" },
  { value: "weekly-show", label: "Weekly Shows" },
  { value: "full-match", label: "Full Matches" },
  { value: "highlight", label: "Highlights" },
];

export interface FiltersState {
  q: string;
  type: string;
  wrestler: string;
  sort: string;
}

export function FiltersBar({
  wrestlers,
  current,
}: {
  wrestlers: { slug: string; name: string }[];
  current: FiltersState;
}) {
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: query });
        }}
        className="flex items-center gap-2 rounded-sm border border-wwc-grey-800 bg-wwc-grey-950 px-3 py-2 sm:w-72"
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

      <div className="flex flex-wrap gap-3">
        <Select value={current.type} onValueChange={(v) => navigate({ type: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Show type" />
          </SelectTrigger>
          <SelectContent>
            {SHOW_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={current.wrestler} onValueChange={(v) => navigate({ wrestler: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Wrestler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wrestlers</SelectItem>
            {wrestlers.map((w) => (
              <SelectItem key={w.slug} value={w.slug}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={current.sort} onValueChange={(v) => navigate({ sort: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
