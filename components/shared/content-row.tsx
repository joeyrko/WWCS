"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Netflix-style horizontal scrolling row: a title, a scrollable strip of
// cards, and hover-revealed arrow buttons that page by ~90% of the visible
// width. Each child gets a fixed card width via itemClassName.
export function ContentRow({
  title,
  children,
  itemClassName = "w-44 sm:w-52",
  className,
}: {
  title: string;
  children: ReactNode;
  itemClassName?: string;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [children]);

  function scrollBy(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9 * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  const items = Children.toArray(children);
  if (items.length === 0) return null;

  return (
    <div className={cn("group/row relative", className)}>
      <h2 className="mb-3 px-4 font-display text-xl uppercase tracking-wide text-white sm:px-6 sm:text-2xl lg:px-8">
        {title}
      </h2>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy("left")}
          aria-label={`Scroll ${title} left`}
          className={cn(
            "absolute inset-y-0 left-0 z-10 hidden w-10 items-center justify-center bg-gradient-to-r from-wwc-black to-transparent text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex sm:w-14",
            !canScrollLeft && "pointer-events-none opacity-0"
          )}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateArrows}
          className="scrollbar-none flex gap-2.5 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-3 sm:px-6 lg:px-8"
        >
          {items.map((child, i) => (
            <div key={i} className={cn("shrink-0", itemClassName)}>
              {child}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy("right")}
          aria-label={`Scroll ${title} right`}
          className={cn(
            "absolute inset-y-0 right-0 z-10 hidden w-10 items-center justify-center bg-gradient-to-l from-wwc-black to-transparent text-white opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex sm:w-14",
            !canScrollRight && "pointer-events-none opacity-0"
          )}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}
