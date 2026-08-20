"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a short fade-up as they scroll into view.
 *
 * Motion is opt-out at two levels: the CSS `prefers-reduced-motion` block
 * neutralises the animation, and this component skips the observer entirely so
 * reduced-motion users get fully-visible content immediately with no transform.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger in milliseconds. Keep under ~400ms so content never feels withheld. */
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!node || prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </Component>
  );
}
