import * as React from "react";
import { cn } from "@/lib/utils";

const controlClasses =
  "w-full rounded-md border border-ink-600 bg-ink-900/80 px-4 py-3 text-sm text-parchment placeholder:text-muted-warm/60 transition-colors focus:border-gold-400 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500/70";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlClasses, className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea">
>(function Textarea({ className, rows = 6, ...props }, ref) {
  return (
    <textarea ref={ref} rows={rows} className={cn(controlClasses, "resize-y", className)} {...props} />
  );
});

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentPropsWithoutRef<"select">>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(controlClasses, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
    );
  },
);

export function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"label"> & { required?: boolean }) {
  return (
    <label
      className={cn(
        "block text-xs font-medium uppercase tracking-[0.12em] text-muted-warm",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-1 text-gold-300" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

/**
 * Wraps a single form control with its label, optional hint and error message,
 * wiring `aria-describedby` / `aria-invalid` through a render prop so every form
 * in the app is accessible by construction rather than by discipline.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (aria: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => React.ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children({
        id: htmlFor,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-warm/80">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
