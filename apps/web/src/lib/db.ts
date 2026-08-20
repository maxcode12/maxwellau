import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * Next.js dev-mode hot reloading re-evaluates modules; caching the client on
 * `globalThis` prevents a new connection pool per reload. In production the
 * module is evaluated once per process.
 *
 * Query logging is dev-only and logs queries without parameter values, so PII
 * from bookings/newsletter rows can never reach the logs.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [{ emit: "stdout", level: "warn" }, { emit: "stdout", level: "error" }]
        : [{ emit: "stdout", level: "error" }],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
