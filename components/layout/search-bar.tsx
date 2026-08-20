"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/watch?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch();
  }

  function handleIconClick() {
    if (!open) {
      setOpen(true);
      return;
    }
    runSearch();
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-center", className)}>
      <div
        className={cn(
          "flex items-center gap-2 overflow-hidden rounded-sm border border-transparent transition-all duration-200",
          open
            ? "w-48 border-wwc-grey-800 bg-wwc-grey-950 px-3 py-2 focus-within:border-wwc-red"
            : "w-9 justify-center"
        )}
      >
        <button
          type="button"
          onClick={handleIconClick}
          aria-label="Search"
          className="flex h-5 w-5 shrink-0 items-center justify-center text-wwc-grey-400 transition-colors hover:text-wwc-white"
        >
          <Search className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => !query && setOpen(false)}
          placeholder="Search shows, wrestlers…"
          aria-label="Search on-demand library"
          className={cn(
            "bg-transparent text-sm text-wwc-white placeholder:text-wwc-grey-500 focus:outline-none",
            open ? "w-full opacity-100" : "w-0 opacity-0"
          )}
        />
      </div>
    </form>
  );
}
