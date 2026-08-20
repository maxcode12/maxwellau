"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { primaryNav, secondaryNav } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  /**
   * The menu stores the route it was opened on rather than a boolean, so
   * navigating anywhere closes it as a pure consequence of the new pathname —
   * no effect, and no cascading render on every route change.
   */
  const [openedOnPath, setOpenedOnPath] = React.useState<string | null>(null);
  const menuOpen = openedOnPath === pathname;
  const setMenuOpen = (open: boolean) => setOpenedOnPath(open ? pathname : null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trap the page behind the open menu and restore scroll on close.
  React.useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedOnPath(null);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || menuOpen
          ? "border-b border-ink-700/80 bg-ink-950/90 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-ink-950/80 to-transparent",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <BrandMark size="sm" />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-sm px-3 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors",
                isActive(item.href)
                  ? "text-gold-200"
                  : "text-parchment/75 hover:text-parchment",
              )}
            >
              {item.label}
              {isActive(item.href) ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-0.5 h-px bg-gold-400"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/booking"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}
          >
            Book Ministry
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex size-10 items-center justify-center rounded-full text-parchment transition-colors hover:bg-parchment/5 lg:hidden"
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-ink-700/60 bg-ink-950/98 lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
          <ul className="space-y-1">
            {[...primaryNav, ...secondaryNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-lg px-4 py-3 transition-colors",
                    isActive(item.href)
                      ? "bg-gold-400/10 text-gold-200"
                      : "text-parchment hover:bg-parchment/5",
                  )}
                >
                  <span className="font-display text-lg">{item.label}</span>
                  <span className="text-xs text-muted-warm">{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/booking"
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-6 w-full")}
          >
            Book Ministry
          </Link>
        </nav>
      </div>
    </header>
  );
}
