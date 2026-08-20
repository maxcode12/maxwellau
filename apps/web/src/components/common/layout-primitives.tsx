import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  as: Component = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <Component className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)} {...props} />;
}

export function Section({
  className,
  as: Component = "section",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <Component className={cn("py-20 sm:py-28", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.28em] text-gold-400/90",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  headingLevel: Heading = "h2",
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
  id?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-4",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        id={id}
        className={cn(
          "text-balance text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem]",
          Heading === "h1" && "text-4xl sm:text-5xl lg:text-6xl",
        )}
      >
        {title}
      </Heading>
      <div
        className={cn(
          "h-px w-20 rule-gold",
          align === "center" && "mx-auto",
        )}
        aria-hidden="true"
      />
      {description ? (
        <p className="text-pretty text-base leading-relaxed text-muted-warm sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-ink-600 bg-ink-900/40 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="font-display text-xl text-parchment">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-warm">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
