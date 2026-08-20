import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * OAuth token encryption at rest: AES-256-GCM with a random IV per value.
 * Stored format: base64(iv).base64(authTag).base64(ciphertext)
 *
 * The key comes from SOCIAL_TOKEN_ENCRYPTION_KEY (32 bytes, base64) held in
 * Azure Key Vault in deployed environments. Tokens are never stored or logged
 * in plain text and are never returned from any API response.
 */

function key(): Buffer {
  const encoded = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY is not configured.");
  }
  const decoded = Buffer.from(encoded, "base64");
  if (decoded.length !== 32) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded.");
  }
  return decoded;
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString("base64")}`;
}

export function decryptToken(stored: string): string {
  const [iv, tag, ciphertext] = stored.split(".");
  if (!iv || !tag || !ciphertext) throw new Error("Malformed encrypted token.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function tokenEncryptionConfigured(): boolean {
  return Boolean(process.env.SOCIAL_TOKEN_ENCRYPTION_KEY);
}
