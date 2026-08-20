import { AlertTriangle, CheckCircle2, Link2 } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/primitives";
import { buttonVariants } from "@/components/ui/button";
import { disconnectAccountAction } from "@/modules/social-accounts/admin-actions";
import { providerConfigured } from "@/modules/social-accounts/oauth";
import { requireRole } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const platforms = [
  {
    id: "YOUTUBE",
    label: "YouTube",
    provider: "google" as const,
    note: "Uploads from an unverified Google API project stay private until the project passes Google's audit.",
  },
  {
    id: "FACEBOOK",
    label: "Facebook",
    provider: "meta" as const,
    note: "Publishing requires a Facebook Page and Meta app review for the pages_manage_posts permission.",
  },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    provider: "meta" as const,
    note: "Requires an Instagram professional account linked to a Facebook Page. Connected via the Facebook flow.",
  },
  {
    id: "TIKTOK",
    label: "TikTok",
    provider: "tiktok" as const,
    note: "Posting requires TikTok Content Posting API approval; unaudited apps can only create private posts.",
  },
] as const;

export default async function SocialAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; provider?: string; connected?: string }>;
}) {
  await requireRole("ADMIN");
  const { error, connected } = await searchParams;

  const accounts = await db.socialAccount.findMany({ orderBy: { platform: "asc" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Social accounts"
        description="Connect the platforms content is distributed to. Tokens are encrypted at rest and never leave the server."
      />

      {connected ? (
        <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Connected {connected} account{connected === "1" ? "" : "s"} successfully.
        </p>
      ) : null}
      {error === "not-configured" ? (
        <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          That platform&rsquo;s developer credentials are not configured in this environment yet.
          Add them to Key Vault / .env.local (see .env.example) to enable the connect flow.
        </p>
      ) : null}
      {error === "denied" || error === "exchange" || error === "state" ? (
        <p role="alert" className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          The connection could not be completed. Please try again.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const platformAccounts = accounts.filter(
            (account) => account.platform === platform.id,
          );
          const configured = providerConfigured(platform.provider);
          const isConnected = platformAccounts.some((account) => account.status === "CONNECTED");

          return (
            <section
              key={platform.id}
              aria-label={platform.label}
              className="rounded-xl border border-ink-700/70 bg-ink-900/50 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg text-parchment">{platform.label}</h2>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Connected
                  </span>
                ) : (
                  <span className="text-xs text-muted-warm">Not connected</span>
                )}
              </div>

              {platformAccounts.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {platformAccounts.map((account) => (
                    <li
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-ink-700/60 px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-parchment">
                          {account.displayName}
                        </span>
                        <span className="block text-xs text-muted-warm">
                          Connected {formatDate(account.connectedAt.toISOString())}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={account.status} />
                        {account.status !== "DISCONNECTED" ? (
                          <form action={disconnectAccountAction}>
                            <input type="hidden" name="accountId" value={account.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-ink-600 px-2.5 py-1 text-xs text-muted-warm transition-colors hover:border-red-500/50 hover:text-red-300"
                            >
                              Disconnect
                            </button>
                          </form>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-warm">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400/70" aria-hidden="true" />
                {platform.note}
              </p>

              <div className="mt-4">
                {configured ? (
                  <a
                    href={`/api/admin/oauth/${platform.provider}/start`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <Link2 aria-hidden="true" />
                    {isConnected ? "Reconnect" : "Connect"}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink-600 px-4 py-2 text-xs text-muted-warm">
                    Blocked — developer credentials required (see .env.example)
                  </span>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
