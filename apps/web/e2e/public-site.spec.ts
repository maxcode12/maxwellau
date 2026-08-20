import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/bio",
  "/music",
  "/videos",
  "/events",
  "/kings-time",
  "/testimonies",
  "/booking",
  "/media",
  "/contact",
];

test.describe("public navigation", () => {
  for (const path of publicRoutes) {
    test(`${path} renders with exactly one h1 and no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("the header links reach every primary page", async ({ page, isMobile }) => {
    await page.goto("/");

    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
    }

    const nav = page.getByRole("navigation", { name: isMobile ? "Mobile" : "Primary" });
    // Non-exact: the mobile menu links include a description in their
    // accessible name ("Music Releases, singles and where to listen.").
    await nav.getByRole("link", { name: "Music" }).click();
    await expect(page).toHaveURL(/\/music$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("skip link is reachable by keyboard and targets main", async ({ page, browserName }) => {
    // WebKit only moves keyboard focus to links with Option+Tab, which
    // Playwright cannot express portably — the behaviour is covered on Chromium.
    test.skip(browserName === "webkit", "WebKit does not Tab to links by default");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", "#main");
  });

  test("an unknown route renders the 404 page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /could not be found/i })).toBeVisible();
  });

  test("the health endpoint reports ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { status: string; service: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("maxwellau-web");
  });

  test("robots and sitemap are served", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });
});
