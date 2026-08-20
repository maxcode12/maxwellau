/**
 * Development seed.
 *
 * Run with: npm run db:seed  (from apps/web)
 *
 * Seeds are for LOCAL DEVELOPMENT ONLY and refuse to run against anything that
 * does not look like the local docker-compose database. Production data is
 * created through the admin CMS, never by seeding.
 */
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const DEV_HOSTS = ["localhost", "127.0.0.1"];

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();

  if (!DEV_HOSTS.includes(host)) {
    throw new Error(
      "Refusing to seed: DATABASE_URL does not point at a local development database.",
    );
  }

  // -------------------------------------------------------------------------
  // Users — local credentials only. The printed password is intentionally
  // simple; it never exists outside a developer machine.
  // -------------------------------------------------------------------------
  const devPassword = "local-dev-password";
  const passwordHash = await hash(devPassword, 12);

  const admin = await db.user.upsert({
    where: { email: "admin@localhost.dev" },
    update: {},
    create: {
      email: "admin@localhost.dev",
      name: "Local Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await db.user.upsert({
    where: { email: "editor@localhost.dev" },
    update: {},
    create: {
      email: "editor@localhost.dev",
      name: "Local Editor",
      passwordHash,
      role: Role.EDITOR,
    },
  });

  // -------------------------------------------------------------------------
  // Artist profile — real content from the official biography.
  // -------------------------------------------------------------------------
  const existingProfile = await db.artistProfile.findFirst();
  if (!existingProfile) {
    await db.artistProfile.create({
      data: {
        name: "Maxwell AU",
        role: "Singer-Songwriter · Recording Artist · Worship Minister",
        tagline: "Worship • Encounter • Transformation",
        summary:
          "Maxwell AU is a singer-songwriter, recording artist and worship minister whose heart is to create an atmosphere where people can encounter the presence of God.",
        sections: [],
      },
    });
  }

  // -------------------------------------------------------------------------
  // Discography — real releases from the official biography.
  // -------------------------------------------------------------------------
  await db.album.upsert({
    where: { slug: "shelter" },
    update: {},
    create: {
      slug: "shelter",
      title: "Shelter",
      type: "ALBUM",
      releasedAt: new Date("2021-05-21T00:00:00.000Z"),
      releasedAtPrecision: "DAY",
      description:
        "Maxwell AU's second album, released on 21 May 2021 — continuing his message of faith, worship, hope and complete dependence on God.",
      visibility: "PUBLISHED",
    },
  });

  const dependableGod = await db.album.upsert({
    where: { slug: "dependable-god" },
    update: {},
    create: {
      slug: "dependable-god",
      title: "Dependable God",
      type: "ALBUM",
      releasedAt: new Date("2014-09-01T00:00:00.000Z"),
      releasedAtPrecision: "MONTH",
      description:
        "The debut album, released in September 2014, featuring “Hallelujah” with Faith Eze and Victorious Worshippers.",
      visibility: "PUBLISHED",
    },
  });

  await db.album.upsert({
    where: { slug: "jesu-we-o-vie" },
    update: {},
    create: {
      slug: "jesu-we-o-vie",
      title: "Jesu We O’ Vie",
      type: "SINGLE",
      releasedAt: new Date("2010-01-01T00:00:00.000Z"),
      releasedAtPrecision: "YEAR",
      description:
        "Maxwell AU's first single, released in 2010 and featuring Prince Micah.",
      visibility: "PUBLISHED",
    },
  });

  await db.song.upsert({
    where: { slug: "hallelujah" },
    update: {},
    create: {
      slug: "hallelujah",
      title: "Hallelujah (feat. Faith Eze & Victorious Worshippers)",
      albumId: dependableGod.id,
      releasedAt: new Date("2014-09-01T00:00:00.000Z"),
      releasedAtPrecision: "MONTH",
      featured: true,
      visibility: "PUBLISHED",
    },
  });

  // -------------------------------------------------------------------------
  // Sample development content (clearly labelled).
  // -------------------------------------------------------------------------
  await db.event.upsert({
    where: { slug: "sample-night-of-worship" },
    update: {},
    create: {
      slug: "sample-night-of-worship",
      title: "Sample Night of Worship",
      description: "Development-only sample event.",
      startsAt: new Date("2026-11-14T18:30:00.000Z"),
      endsAt: new Date("2026-11-14T21:30:00.000Z"),
      venue: "Sample Venue",
      city: "London",
      country: "United Kingdom",
      countryCode: "GB",
      isFree: true,
      visibility: "DRAFT",
    },
  });

  await db.siteSetting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        tagline: "Worship • Encounter • Transformation",
        sampleContent: true,
      },
    },
  });

  console.log("Seed complete.");
  console.log("  Admin login:  admin@localhost.dev");
  console.log("  Editor login: editor@localhost.dev");
  console.log(`  Password:     ${devPassword} (local development only)`);
  console.log(`  Admin id:     ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
