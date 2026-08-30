import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold tracking-wide uppercase transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-wwc-red text-wwc-white hover:bg-wwc-red-glow hover:shadow-[0_0_24px_rgba(0,56,240,0.5)] active:bg-wwc-red-dark",
        secondary:
          "bg-wwc-white text-wwc-black hover:bg-wwc-grey-200 active:bg-wwc-grey-300",
        outline:
          "border border-wwc-grey-600 bg-transparent text-wwc-white hover:border-wwc-red hover:text-wwc-red",
        ghost: "bg-transparent text-wwc-white hover:bg-wwc-grey-900",
        link: "bg-transparent text-wwc-red underline-offset-4 hover:underline p-0 normal-case font-medium",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
