import { expect, test, type Page } from "@playwright/test";

/**
 * Direct-to-Blob upload flow against the local Azurite emulator.
 * Requires: docker compose up -d azurite && npm run db:seed.
 */
const ADMIN_EMAIL = "admin@localhost.dev";
const ADMIN_PASSWORD = "local-dev-password";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

// A minimal valid 1x1 PNG.
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.describe("media upload", () => {
  // Chromium only: the flow is browser-independent and one pass keeps CI fast.
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile);

  test("an admin can upload an image directly to blob storage", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/media");

    const marker = `E2E Upload ${Date.now().toString(36)}`;

    await page.getByLabel("File").setInputFiles({
      name: "e2e-test.png",
      mimeType: "image/png",
      buffer: PNG_BYTES,
    });
    await page.getByLabel("Title").fill(marker);
    await page.getByLabel("Alt text").fill("A tiny test image uploaded by Playwright.");
    await page.getByRole("button", { name: "Upload" }).click();

    await expect(page.getByText("Upload complete — the file is ready to use.")).toBeVisible({
      timeout: 20_000,
    });

    // The library lists the new file as READY.
    await page.reload();
    const row = page.locator("tr", { hasText: marker });
    await expect(row).toBeVisible();
    await expect(row.getByText("READY")).toBeVisible();
  });

  test("an unsupported file type is rejected before any upload starts", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/media");

    await page.getByLabel("File").setInputFiles({
      name: "malicious.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("MZ"),
    });
    await page.getByLabel("Title").fill("Should never upload");
    await page.getByRole("button", { name: "Upload" }).click();

    await expect(page.getByText(/not supported/)).toBeVisible();
  });
});
