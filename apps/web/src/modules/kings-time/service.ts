import { withSamples } from "@/content/content-mode";
import { sampleKingsTimeSessions } from "@/content/sample/kings-time";
import type { KingsTimeSession } from "@/modules/kings-time/types";

/**
 * King's Time read model: CMS-managed rows first (Phase 3), sample records as
 * the fallback while the database is empty or unreachable.
 */

type DbSession = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  scriptureReference: string | null;
  scriptureText: string | null;
  livestreamUrl: string | null;
  replayUrl: string | null;
  status: KingsTimeSession["status"];
};

function mapSession(row: DbSession): KingsTimeSession {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    theme: row.theme,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    scripture: row.scriptureReference
      ? { reference: row.scriptureReference, text: row.scriptureText }
      : null,
    imageSlug: null,
    livestreamUrl: row.livestreamUrl,
    replayUrl: row.replayUrl,
    relatedVideoSlugs: [],
    status: row.status,
    isSample: false,
  };
}

async function allSessions(): Promise<readonly KingsTimeSession[]> {
  try {
    const { db } = await import("@/lib/db");
    const rows = await db.kingsTimeSession.findMany({
      where: { visibility: "PUBLISHED" },
      orderBy: { startsAt: "desc" },
    });
    if (rows.length > 0) return rows.map(mapSession);
  } catch {
    // fall through to sample content
  }
  return withSamples(sampleKingsTimeSessions);
}

function sessionEnd(session: KingsTimeSession): number {
  return Date.parse(session.endsAt ?? session.startsAt);
}

export type SessionView = { readonly session: KingsTimeSession; readonly isUpcoming: boolean };

/** The session to feature on the home page: the next one, else the most recent. */
export async function getCurrentSession(now = Date.now()): Promise<SessionView | null> {
  const sessions = await allSessions();
  const upcoming = [...sessions]
    .filter((session) => sessionEnd(session) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  if (upcoming[0]) return { session: upcoming[0], isUpcoming: true };

  const past = [...sessions].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  return past[0] ? { session: past[0], isUpcoming: false } : null;
}

export async function listSessions(now = Date.now()): Promise<{
  upcoming: KingsTimeSession[];
  archive: KingsTimeSession[];
}> {
  const sessions = [...(await allSessions())];
  return {
    upcoming: sessions
      .filter((session) => sessionEnd(session) >= now)
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    archive: sessions
      .filter((session) => sessionEnd(session) < now)
      .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)),
  };
}

export async function getSessionBySlug(slug: string): Promise<KingsTimeSession | null> {
  return (await allSessions()).find((session) => session.slug === slug) ?? null;
}

export type SessionDetail = { readonly session: KingsTimeSession; readonly isPast: boolean };

export async function getSessionDetail(
  slug: string,
  now = Date.now(),
): Promise<SessionDetail | null> {
  const session = await getSessionBySlug(slug);
  return session ? { session, isPast: sessionEnd(session) < now } : null;
}
