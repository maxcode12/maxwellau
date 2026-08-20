import { expect, test, type Page } from "@playwright/test";

/**
 * Publishing engine, web side: composing a website-only post completes
 * synchronously (no social destinations queued) and appears in the history.
 * The queue/worker path and platform adapters are exercised separately —
 * live social publication needs external developer credentials.
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

test.describe("publishing", () => {
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile);

  test("a website-only post publishes and appears in history", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/publishing/new");

    const marker = `E2E Post ${Date.now().toString(36)}`;
    await page.getByLabel("Title").fill(marker);
    await page.getByLabel("Description").fill("Created by the publishing E2E test.");
    // Website is checked by default; no social accounts are connected locally.
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page).toHaveURL(/\/admin\/publishing$/);
    const card = page.locator("li", { hasText: marker }).first();
    await expect(card).toBeVisible();
    await expect(card.getByText("COMPLETED")).toBeVisible();
  });

  test("the social accounts page reports unconfigured platforms honestly", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/social-accounts");

    await expect(page.getByRole("heading", { name: "Social accounts" })).toBeVisible();
    // No developer credentials exist locally, so every platform shows blocked.
    await expect(page.getByText("Blocked — developer credentials required").first()).toBeVisible();
  });
});
