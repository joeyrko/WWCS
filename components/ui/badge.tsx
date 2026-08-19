import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-wwc-grey-800 text-wwc-white",
        red: "bg-wwc-red text-wwc-white",
        outline: "border border-wwc-grey-600 text-wwc-grey-200",
        free: "bg-wwc-grey-700 text-wwc-white",
        subscribers: "border border-wwc-red text-wwc-red",
        purchase: "bg-wwc-white text-wwc-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
