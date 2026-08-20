import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import {
  buildAuthorizeUrl,
  providerConfigured,
  type OAuthProviderId,
} from "@/modules/social-accounts/oauth";

export const dynamic = "force-dynamic";

const PROVIDERS: readonly OAuthProviderId[] = ["google", "meta", "tiktok"];

/** Begins a platform connect flow. ADMIN only. */
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

  if (!providerConfigured(providerId)) {
    return NextResponse.redirect(
      new URL(`/admin/social-accounts?error=not-configured&provider=${providerId}`, request.url),
    );
  }

  return NextResponse.redirect(buildAuthorizeUrl(providerId));
}
