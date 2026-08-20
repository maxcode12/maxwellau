import Link from "next/link";
import { Plus, RotateCcw } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { buttonVariants } from "@/components/ui/button";
import { retryPublicationAction } from "@/modules/publishing/admin-actions";
import { db } from "@/lib/db";
import { cn, formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPublishingPage() {
  const posts = await db.socialPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      media: { select: { title: true, type: true } },
      publications: {
        include: { account: { select: { platform: true, displayName: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Publishing"
        description="Upload once, distribute everywhere. Each destination succeeds or fails independently — a failure never affects a destination that already published."
        action={
          <Link
            href="/admin/publishing/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus aria-hidden="true" />
            New post
          </Link>
        }
      />

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-600 px-5 py-14 text-center text-sm text-muted-warm">
          Nothing published yet. Create the first post to distribute content to the website and
          connected social platforms.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="rounded-xl border border-ink-700/70 bg-ink-900/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg text-parchment">{post.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-warm">
                    {post.media ? `${post.media.title} · ` : "No media · "}
                    {post.scheduledFor
                      ? `Scheduled for ${formatDate(post.scheduledFor.toISOString())} ${formatTime(post.scheduledFor.toISOString())} UTC`
                      : `Created ${formatDate(post.createdAt.toISOString())}`}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </div>

              <ul className="mt-4 divide-y divide-ink-700/40 border-t border-ink-700/40">
                {post.publishToWebsite ? (
                  <li className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm text-parchment">Website</span>
                    <StatusBadge status={post.status === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED"} />
                  </li>
                ) : null}
                {post.publications.map((publication) => (
                  <li key={publication.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-sm text-parchment">
                        {publication.account.platform} — {publication.account.displayName}
                      </span>
                      {publication.lastError ? (
                        <span className="block truncate text-xs text-red-300">
                          {publication.lastError}
                        </span>
                      ) : publication.externalUrl ? (
                        <a
                          href={publication.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-xs text-gold-200 hover:underline"
                        >
                          {publication.externalUrl}
                        </a>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={publication.status} />
                      {publication.status === "FAILED" ? (
                        <form action={retryPublicationAction}>
                          <input type="hidden" name="publicationId" value={publication.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-full border border-gold-500/50 px-2.5 py-1 text-xs text-gold-200 transition-colors hover:bg-gold-400/10"
                          >
                            <RotateCcw className="size-3" aria-hidden="true" />
                            Retry
                          </button>
                        </form>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
