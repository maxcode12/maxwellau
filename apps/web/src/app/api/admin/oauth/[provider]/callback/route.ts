import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import {
  exchangeCode,
  verifyState,
  type OAuthProviderId,
} from "@/modules/social-accounts/oauth";
import { persistConnection } from "@/modules/social-accounts/connect";

export const dynamic = "force-dynamic";

const PROVIDERS: readonly OAuthProviderId[] = ["google", "meta", "tiktok"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { provider } = await params;
  if (!PROVIDERS.includes(provider as OAuthProviderId)) {
    return NextResponse.json({ error: "Unknown provider." }, { status: 404 });
  }
  const providerId = provider as OAuthProviderId;

  const url = request.nextUrl;
  const backTo = (query: string) =>
    NextResponse.redirect(new URL(`/admin/social-accounts?${query}`, request.url));

  if (!verifyState(url.searchParams.get("state"))) {
    return backTo(`error=state&provider=${providerId}`);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    // The user declined the consent screen, or the platform sent an error.
    return backTo(`error=denied&provider=${providerId}`);
  }

  try {
    const tokens = await exchangeCode(providerId, code);
    const { connected } = await persistConnection(providerId, tokens, user.id);
    return backTo(`connected=${encodeURIComponent(connected.length.toString())}`);
  } catch (error) {
    // Log the class of failure only — no tokens, no provider payloads.
    console.error(
      JSON.stringify({
        event: "oauth.connect_failed",
        provider: providerId,
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
    return backTo(`error=exchange&provider=${providerId}`);
  }
}
