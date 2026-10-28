import { z } from "zod";

/**
 * Environment validation.
 *
 * Server variables are only ever read on the server. Client variables must be
 * prefixed `NEXT_PUBLIC_` and are inlined at build time — never put a secret
 * behind that prefix.
 *
 * Validation is lazy so that importing this module in a Client Component (via a
 * shared barrel, for instance) can never throw for missing server variables.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Postgres connection string. Introduced in Phase 2. */
  DATABASE_URL: z.string().url().optional(),
  /** Azure Blob Storage account name. Introduced in Phase 2/4. */
  AZURE_STORAGE_ACCOUNT: z.string().min(3).optional(),
  AZURE_STORAGE_CONTAINER_MEDIA: z.string().min(1).default("media"),
  AZURE_STORAGE_CONTAINER_PUBLIC: z.string().min(1).default("public-media"),
  /**
   * Transactional email over SMTP (Brevo). All four SMTP_* values must be set
   * together; with none set, email is a logged no-op so local dev and CI need
   * no provider.
   */
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  /** Verified sender, e.g. `Maxwell AU <no-reply@maxwellau.com>`. */
  EMAIL_FROM: z.string().min(3).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://maxwellau.com"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

let cachedServerEnv: ServerEnv | undefined;

/** Server-only. Throws a readable aggregate error if configuration is invalid. */
export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    // Never interpolate the values themselves — they may be secrets.
    throw new Error(`Invalid server environment configuration:\n${issues}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export const clientEnv: ClientEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
