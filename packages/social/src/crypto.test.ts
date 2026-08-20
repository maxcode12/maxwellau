import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { decryptToken, encryptToken, tokenEncryptionConfigured } from "./crypto";

describe("token crypto", () => {
  const originalKey = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  afterEach(() => {
    process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = originalKey;
  });

  it("round-trips a token", () => {
    const token = "ya29.example-access-token-value";
    expect(decryptToken(encryptToken(token))).toBe(token);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const token = "refresh-token";
    expect(encryptToken(token)).not.toBe(encryptToken(token));
  });

  it("rejects tampered ciphertext", () => {
    const stored = encryptToken("secret");
    const parts = stored.split(".");
    const tampered = `${parts[0]}.${parts[1]}.${Buffer.from("tampered!").toString("base64")}`;
    expect(() => decryptToken(tampered)).toThrow();
  });

  it("rejects a wrong-size key", () => {
    process.env.SOCIAL_TOKEN_ENCRYPTION_KEY = Buffer.from("short").toString("base64");
    expect(() => encryptToken("x")).toThrow(/32 bytes/);
  });

  it("reports configuration state", () => {
    expect(tokenEncryptionConfigured()).toBe(true);
    delete process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
    expect(tokenEncryptionConfigured()).toBe(false);
  });
});
