import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        gold: "border-gold-500/40 bg-gold-400/10 text-gold-200",
        royal: "border-royal-400/40 bg-royal-500/15 text-royal-400",
        neutral: "border-ink-600 bg-ink-800 text-muted-warm",
        live: "border-red-500/50 bg-red-500/15 text-red-300",
      },
    },
    defaultVariants: { variant: "gold" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
