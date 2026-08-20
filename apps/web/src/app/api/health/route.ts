import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Liveness/readiness probe for Azure Container Apps and CI smoke checks.
 *
 * Returns only non-sensitive facts. As dependencies are added (PostgreSQL in
 * Phase 2, Blob Storage in Phase 4) their reachability is reported as a boolean
 * per dependency — never a connection string, host name or credential.
 */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "maxwellau-web",
      // Set by CI at build time; absent locally.
      version: process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
