"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Image as ImageIcon,
  Crown,
  Disc3,
  FileClock,
  Film,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Quote,
  Send,
  Settings,
  Share2,
  UserRound,
  X,
} from "lucide-react";
import { logoutAction } from "@/modules/auth/actions";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/modules/auth/session";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
};

const navGroups: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/music", label: "Music", icon: Disc3 },
      { href: "/admin/videos", label: "Videos", icon: Film },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/kings-time", label: "King's Time", icon: Crown },
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/testimonies", label: "Testimonies", icon: Quote },
      { href: "/admin/profile", label: "Artist Profile", icon: UserRound },
    ],
  },
  {
    heading: "Publishing",
    items: [
      { href: "/admin/publishing", label: "Publishing", icon: Send },
      { href: "/admin/social-accounts", label: "Social Accounts", icon: Share2, adminOnly: true },
    ],
  },
  {
    heading: "Ministry",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: Inbox },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    heading: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
      { href: "/admin/audit", label: "Audit Log", icon: FileClock, adminOnly: true },
    ],
  },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {navGroups.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || user.role === "ADMIN");
        if (items.length === 0) return null;
        return (
          <div key={group.heading}>
            <p className="px-3 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-muted-warm/70">
              {group.heading}
            </p>
            <ul className="mt-2 space-y-0.5">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-gold-400/10 text-gold-200"
                        : "text-parchment/75 hover:bg-parchment/5 hover:text-parchment",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const userFooter = (
    <div className="border-t border-ink-700/70 p-4">
      <p className="truncate text-sm text-parchment">{user.name}</p>
      <p className="truncate text-xs text-muted-warm">
        {user.email} · {user.role === "ADMIN" ? "Administrator" : "Editor"}
      </p>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-xs text-parchment/80 transition-colors hover:border-gold-500/50 hover:text-gold-200"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-ink-700/70 bg-ink-900/50 lg:flex">
        <div className="flex items-center gap-3 border-b border-ink-700/70 px-5 py-4">
          <Image src={siteConfig.brand.mark} alt="" width={34} height={34} aria-hidden="true" />
          <span className="font-display text-base text-parchment">
            Maxwell <span className="text-gold-300">AU</span>{" "}
            <span className="text-muted-warm">Admin</span>
          </span>
        </div>
        {nav}
        {userFooter}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-700/70 bg-ink-950/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5">
            <Image src={siteConfig.brand.mark} alt="" width={28} height={28} aria-hidden="true" />
            <span className="font-display text-sm text-parchment">
              Maxwell <span className="text-gold-300">AU</span>{" "}
              <span className="text-muted-warm">Admin</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
            className="inline-flex size-9 items-center justify-center rounded-full text-parchment hover:bg-parchment/5"
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        <div
          id="admin-mobile-nav"
          hidden={!mobileOpen}
          className="border-b border-ink-700/70 bg-ink-900 lg:hidden"
        >
          {nav}
          {userFooter}
        </div>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
