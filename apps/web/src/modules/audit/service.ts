import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Audit trail for sensitive administrative changes.
 *
 * `detail` must be sanitised by the caller — status transitions, changed field
 * NAMES and ids belong here; tokens, passwords and form contents never do.
 * Auditing never blocks the action it records: failures are logged and
 * swallowed.
 */
export async function recordAudit(entry: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  detail?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        detail: entry.detail ?? {},
      },
    });
  } catch {
    console.error(
      JSON.stringify({
        event: "audit.write_failed",
        action: entry.action,
        entityType: entry.entityType,
      }),
    );
  }
}

export async function listAuditEntries(limit = 100) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true, email: true } } },
  });
}
