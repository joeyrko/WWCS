"use client";

import { motion } from "framer-motion";
import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_DELAY = 0.4;
const STEP = 0.08;

// Wraps already-rendered (often server-rendered) children — one per grid/row
// item — and reveals each with an incremental delay as it scrolls into view.
export function StaggerGrid({
  children,
  className,
  itemClassName,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: Math.min(i * STEP, MAX_DELAY), ease: EASE }}
          // grid + h-full: fills the parent grid/flex cell, then stretches
          // its own single child to match — otherwise a plain wrapper div
          // breaks equal-height card layouts (buttons no longer align).
          className={cn("grid h-full", itemClassName)}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
