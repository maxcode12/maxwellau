import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Liveness/readiness probe for Azure Container Apps and CI smoke checks.
 *
 * Returns only non-sensitive facts — dependency reachability is a boolean per
 * dependency, never a connection string, host name or credential. The endpoint
 * stays 200 while the site can serve pages; database trouble is surfaced in
 * the body for alerting without taking the public site out of rotation.
 */
export async function GET() {
  let database = false;
  if (process.env.DATABASE_URL) {
    try {
      await db.$queryRaw`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      service: "maxwellau-web",
      // Set by CI at build time; absent locally.
      version: process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: process.env.DATABASE_URL ? database : "not-configured",
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
