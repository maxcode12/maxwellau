import Link from "next/link";
import {
  CalendarDays,
  Crown,
  Disc3,
  Film,
  Inbox,
  Mail,
  Quote,
} from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { db } from "@/lib/db";
import { requireUser } from "@/modules/auth/guards";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireUser();

  const [
    newBookings,
    totalBookings,
    publishedAlbums,
    publishedVideos,
    upcomingEvents,
    pendingTestimonies,
    kingsTimeSessions,
    subscribers,
    recentBookings,
  ] = await Promise.all([
    db.booking.count({ where: { status: "NEW" } }),
    db.booking.count(),
    db.album.count({ where: { visibility: "PUBLISHED" } }),
    db.video.count({ where: { visibility: "PUBLISHED" } }),
    db.event.count({ where: { startsAt: { gte: new Date() }, status: { not: "CANCELLED" } } }),
    db.testimony.count({ where: { status: "PENDING" } }),
    db.kingsTimeSession.count(),
    db.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }),
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        contactName: true,
        eventType: true,
        eventDate: true,
        status: true,
      },
    }),
  ]);

  const cards = [
    { label: "New bookings", value: newBookings, total: `${totalBookings} total`, href: "/admin/bookings", icon: Inbox },
    { label: "Published releases", value: publishedAlbums, href: "/admin/music", icon: Disc3 },
    { label: "Published videos", value: publishedVideos, href: "/admin/videos", icon: Film },
    { label: "Upcoming events", value: upcomingEvents, href: "/admin/events", icon: CalendarDays },
    { label: "Pending testimonies", value: pendingTestimonies, href: "/admin/testimonies", icon: Quote },
    { label: "King's Time sessions", value: kingsTimeSessions, href: "/admin/kings-time", icon: Crown },
    { label: "Newsletter subscribers", value: subscribers, href: "/admin/newsletter", icon: Mail },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description="A snapshot of the ministry platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-ink-700/70 bg-ink-900/50 p-5 transition-colors hover:border-gold-500/50"
          >
            <div className="flex items-center justify-between">
              <card.icon className="size-5 text-gold-400" aria-hidden="true" />
              {"total" in card && card.total ? (
                <span className="text-xs text-muted-warm">{card.total}</span>
              ) : null}
            </div>
            <p className="mt-4 font-display text-3xl text-parchment">{card.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-warm">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      <section aria-labelledby="recent-bookings">
        <h2 id="recent-bookings" className="font-display text-xl text-parchment">
          Latest booking requests
        </h2>
        {recentBookings.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-ink-600 px-5 py-10 text-center text-sm text-muted-warm">
            No booking requests yet. They will appear here as soon as one is submitted.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-700/50 rounded-xl border border-ink-700/70">
            {recentBookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-parchment/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-parchment">
                      {booking.contactName}
                    </span>
                    <span className="block text-xs text-muted-warm">
                      {booking.reference} · {booking.eventType.replaceAll("_", " ").toLowerCase()} ·{" "}
                      {formatDate(booking.eventDate.toISOString())}
                    </span>
                  </span>
                  <StatusBadge status={booking.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
