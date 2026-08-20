import "server-only";
import { encryptToken } from "@maxwellau/social";
import { db } from "@/lib/db";
import { recordAudit } from "@/modules/audit/service";
import type { OAuthProviderId, TokenExchange } from "@/modules/social-accounts/oauth";

/**
 * Post-OAuth account discovery and persistence.
 *
 * Tokens are AES-256-GCM encrypted before they touch the database and are
 * never returned from any API response. Capability facts discovered at
 * connect time (page ids, linked IG account, channel title) are stored on the
 * SocialAccount row so the composer can reason about them without extra calls.
 */

export async function persistConnection(
  provider: OAuthProviderId,
  tokens: TokenExchange,
  actorId: string,
): Promise<{ connected: string[] }> {
  const connected: string[] = [];

  if (provider === "google") {
    // Identify the channel the tokens grant access to.
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    );
    if (!response.ok) throw new Error("Could not read the YouTube channel for this account.");
    const body = (await response.json()) as {
      items?: { id: string; snippet?: { title?: string } }[];
    };
    const channel = body.items?.[0];
    if (!channel) throw new Error("No YouTube channel is associated with this Google account.");

    await upsertAccount({
      platform: "YOUTUBE",
      externalId: channel.id,
      displayName: channel.snippet?.title ?? "YouTube channel",
      tokens,
      capabilities: {},
    });
    connected.push(`YouTube — ${channel.snippet?.title ?? channel.id}`);
  }

  if (provider === "meta") {
    // Enumerate managed Pages; each Page gets its own account row with the
    // PAGE token, plus a linked Instagram business account when present.
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(
        tokens.accessToken,
      )}`,
    );
    if (!pagesResponse.ok) throw new Error("Could not list Facebook Pages for this account.");
    const pages = (await pagesResponse.json()) as {
      data?: {
        id: string;
        name: string;
        access_token: string;
        instagram_business_account?: { id: string; username?: string };
      }[];
    };
    if (!pages.data?.length) {
      throw new Error("This Facebook account does not manage any Pages.");
    }

    for (const page of pages.data) {
      await upsertAccount({
        platform: "FACEBOOK",
        externalId: page.id,
        displayName: page.name,
        tokens: { ...tokens, accessToken: page.access_token },
        capabilities: {},
      });
      connected.push(`Facebook — ${page.name}`);

      if (page.instagram_business_account) {
        await upsertAccount({
          platform: "INSTAGRAM",
          externalId: page.instagram_business_account.id,
          displayName: page.instagram_business_account.username ?? "Instagram",
          tokens: { ...tokens, accessToken: page.access_token },
          capabilities: { linkedPageId: page.id },
        });
        connected.push(`Instagram — ${page.instagram_business_account.username ?? "account"}`);
      }
    }
  }

  if (provider === "tiktok") {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    );
    if (!response.ok) throw new Error("Could not read the TikTok account profile.");
    const body = (await response.json()) as {
      data?: { user?: { open_id?: string; display_name?: string } };
    };
    const user = body.data?.user;
    if (!user?.open_id) throw new Error("TikTok did not return an account id.");

    await upsertAccount({
      platform: "TIKTOK",
      externalId: user.open_id,
      displayName: user.display_name ?? "TikTok account",
      tokens,
      capabilities: {},
    });
    connected.push(`TikTok — ${user.display_name ?? user.open_id}`);
  }

  await recordAudit({
    actorId,
    action: "social.account_connected",
    entityType: "SocialAccount",
    entityId: provider,
    detail: { provider, count: connected.length },
  });

  return { connected };
}

async function upsertAccount(input: {
  platform: "YOUTUBE" | "FACEBOOK" | "INSTAGRAM" | "TIKTOK";
  externalId: string;
  displayName: string;
  tokens: TokenExchange;
  capabilities: Record<string, unknown>;
}): Promise<void> {
  const data = {
    displayName: input.displayName,
    status: "CONNECTED" as const,
    encryptedAccessToken: encryptToken(input.tokens.accessToken),
    encryptedRefreshToken: input.tokens.refreshToken
      ? encryptToken(input.tokens.refreshToken)
      : null,
    accessTokenExpiresAt: input.tokens.expiresInSeconds
      ? new Date(Date.now() + input.tokens.expiresInSeconds * 1000)
      : null,
    scopes: input.tokens.scopes,
    capabilities: input.capabilities as object,
  };

  await db.socialAccount.upsert({
    where: {
      platform_externalId: { platform: input.platform, externalId: input.externalId },
    },
    update: data,
    create: { platform: input.platform, externalId: input.externalId, ...data },
  });
}
