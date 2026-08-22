/**
 * One-off bootstrap: create (or reset) a single ADMIN user against whatever
 * DATABASE_URL is currently set — used for staging/prod, where the dev seed
 * (prisma/seed.ts) deliberately refuses to run.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx prisma/bootstrap-admin.ts <email>
 *
 * Prints a freshly generated password once. It is not stored anywhere else —
 * save it in a password manager immediately.
 */
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx prisma/bootstrap-admin.ts <email>");
    process.exit(1);
  }

  const password = randomBytes(18).toString("base64url");
  const passwordHash = await hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", isActive: true },
    create: { email, name: "Maxwell AU", passwordHash, role: "ADMIN" },
  });

  console.log("Admin user ready.");
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log("Save this password now — it is not stored anywhere else.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
