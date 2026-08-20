import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-gold-200 to-gold-500 text-ink-950 shadow-[0_10px_30px_-12px_rgba(212,165,55,0.7)] hover:from-gold-100 hover:to-gold-400 hover:shadow-[0_14px_40px_-10px_rgba(212,165,55,0.85)]",
        outline:
          "border border-gold-500/50 bg-transparent text-gold-200 hover:border-gold-300 hover:bg-gold-400/10 hover:text-gold-100",
        ghost: "text-parchment/80 hover:bg-parchment/5 hover:text-parchment",
        subtle: "bg-ink-800 text-parchment hover:bg-ink-700",
        link: "rounded-none text-gold-300 underline-offset-4 hover:text-gold-200 hover:underline",
        destructive: "bg-red-900/80 text-red-50 hover:bg-red-800",
      },
      size: {
        sm: "h-9 px-4 text-xs [&_svg]:size-4",
        md: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-13 px-8 text-sm uppercase tracking-[0.14em] [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
