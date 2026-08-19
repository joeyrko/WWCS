"use client";

import { motion, type Variants } from "framer-motion";
import { Children, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// Mount-triggered (not scroll-triggered) staggered entrance — for
// above-the-fold content like the hero, where every child is already in
// view on load and should animate in as a sequence rather than a block.
export function StaggerIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className={className}>
      {Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
