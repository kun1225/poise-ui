"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";

import { springs } from "@poise-ui/motion";
import { cn } from "@poise-ui/shared";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md font-medium outline-none select-none",
    "transition-colors duration-150 ease-out",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        solid: "bg-accent text-accent-fg hover:bg-accent/90",
        soft: "bg-muted text-fg hover:bg-muted/70",
        outline: "border border-border bg-transparent text-fg hover:bg-muted",
        ghost: "bg-transparent text-fg hover:bg-muted",
        danger: "bg-danger text-danger-fg hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size }), className)}
      whileTap={props.disabled ? undefined : { scale: 0.96 }}
      transition={springs.snappy}
      {...props}
    />
  );
}

export { buttonVariants };
