import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { absoluteUrl } from "@/lib/site-config";

/**
 * OAuth plumbing for the social platform connect flows.
 *
 * Providers are configured via environment variables (Key Vault in Azure).
 * A provider with missing configuration is reported as "not configured" and
 * its connect button is disabled — nothing is faked.
 *
 * CSRF: the `state` parameter is an HMAC-signed random nonce checked on
 * callback. The signing key is the token encryption key (already secret,
 * already in Key Vault).
 */

export type OAuthProviderId = "google" | "meta" | "tiktok";

type ProviderConfig = {
  readonly authorizeUrl: string;
  readonly clientId: string | undefined;
  readonly clientSecret: string | undefined;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
  readonly extraAuthParams?: Record<string, string>;
  /** Which parameter carries the client id (TikTok uses client_key). */
  readonly clientIdParam?: string;
};

export function providerConfig(provider: OAuthProviderId): ProviderConfig {
  switch (provider) {
    case "google":
      return {
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirectUri:
          process.env.GOOGLE_OAUTH_REDIRECT_URI ?? absoluteUrl("/api/admin/oauth/google/callback"),
        scopes: [
          "https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube.readonly",
        ],
        extraAuthParams: { access_type: "offline", prompt: "consent" },
      };
    case "meta":
      return {
        authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
        clientId: process.env.META_APP_ID,
        clientSecret: process.env.META_APP_SECRET,
        redirectUri:
          process.env.META_OAUTH_REDIRECT_URI ?? absoluteUrl("/api/admin/oauth/meta/callback"),
        scopes: [
          "pages_show_list",
          "pages_manage_posts",
          "pages_read_engagement",
          "instagram_basic",
          "instagram_content_publish",
        ],
      };
    case "tiktok":
      return {
        authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
        clientId: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        redirectUri:
          process.env.TIKTOK_OAUTH_REDIRECT_URI ?? absoluteUrl("/api/admin/oauth/tiktok/callback"),
        scopes: ["user.info.basic", "video.publish"],
        clientIdParam: "client_key",
      };
  }
}

export function providerConfigured(provider: OAuthProviderId): boolean {
  const config = providerConfig(provider);
  return Boolean(config.clientId && config.clientSecret);
}

function stateKey(): Buffer {
  const key = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY ?? "dev-state-key-not-for-production";
  return createHmac("sha256", "oauth-state").update(key).digest();
}

export function mintState(): string {
  const nonce = randomBytes(16).toString("base64url");
  const signature = createHmac("sha256", stateKey()).update(nonce).digest("base64url");
  return `${nonce}.${signature}`;
}

export function verifyState(state: string | null): boolean {
  if (!state) return false;
  const [nonce, signature] = state.split(".");
  if (!nonce || !signature) return false;
  const expected = createHmac("sha256", stateKey()).update(nonce).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function buildAuthorizeUrl(provider: OAuthProviderId): string {
  const config = providerConfig(provider);
  const url = new URL(config.authorizeUrl);
  url.searchParams.set(config.clientIdParam ?? "client_id", config.clientId ?? "");
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(provider === "meta" ? "," : " "));
  url.searchParams.set("state", mintState());
  for (const [key, value] of Object.entries(config.extraAuthParams ?? {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export type TokenExchange = {
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number | null;
  scopes: string[];
};

export async function exchangeCode(
  provider: OAuthProviderId,
  code: string,
): Promise<TokenExchange> {
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider} OAuth is not configured.`);
  }

  if (provider === "google") {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) throw new Error(`Google token exchange failed (HTTP ${response.status}).`);
    const body = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token ?? null,
      expiresInSeconds: body.expires_in ?? null,
      scopes: body.scope?.split(" ") ?? [...config.scopes],
    };
  }

  if (provider === "meta") {
    const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("client_secret", config.clientSecret);
    url.searchParams.set("redirect_uri", config.redirectUri);
    url.searchParams.set("code", code);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Meta token exchange failed (HTTP ${response.status}).`);
    const body = (await response.json()) as { access_token: string; expires_in?: number };
    return {
      accessToken: body.access_token,
      refreshToken: null, // Meta uses long-lived tokens instead of refresh tokens.
      expiresInSeconds: body.expires_in ?? null,
      scopes: [...config.scopes],
    };
  }

  // TikTok
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });
  if (!response.ok) throw new Error(`TikTok token exchange failed (HTTP ${response.status}).`);
  const body = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    open_id?: string;
  };
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? null,
    expiresInSeconds: body.expires_in ?? null,
    scopes: body.scope?.split(",") ?? [...config.scopes],
  };
}
