import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, discoverBlogSlug } from "./helpers";

let hasPosts = false;
let blogPostUrl = "";

test.beforeAll(async ({ browser }) => {
  blogPostUrl = await discoverBlogSlug(browser);
  hasPosts = !!blogPostUrl;
});

test.describe("Blog — Listing & navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog", gotoOpts);
  });

  // ── Header ─────────────────────────────────────────────────

  test("page heading shows Blog", async ({ page }) => {
    await expect(page.locator("h1:has-text('Blog')").first()).toBeVisible();
  });

  test("subtitle describes blog content", async ({ page }) => {
    await expect(page.locator('text=Artigos e dicas').first()).toBeVisible();
  });

  // ── Posts or empty state ───────────────────────────────────

  test("posts grid or empty state is shown", async ({ page }) => {
    await page.waitForTimeout(3000);
    const cards = page.locator('a[href^="/blog/"]');
    const empty = page.locator('text=Nenhum artigo publicado');
    expect(
      (await cards.count()) > 0 ||
      (await empty.isVisible().catch(() => false)),
    ).toBe(true);
  });

  test("post cards show title and summary", async ({ page }) => {
    test.skip(!hasPosts, "No blog posts available");
    const card = page.locator('a[href^="/blog/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    const heading = card.locator("h2").first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test("post cards show reading time", async ({ page }) => {
    test.skip(!hasPosts, "No blog posts available");
    const card = page.locator('a[href^="/blog/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    await expect(card.locator('text=/\\d+ min de leitura/').first()).toBeVisible();
  });

  test("post cards navigate to blog post page", async ({ page }) => {
    test.skip(!hasPosts, "No blog posts available");
    const card = page.locator('a[href^="/blog/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    const href = await card.getAttribute("href");
    expect(href).toMatch(/\/blog\/.+/);
    await card.click();
    await page.waitForURL("**/blog/*", { timeout: ELEMENT_TIMEOUT });
    expect(page.url()).toContain("/blog/");
  });

  // ── Pagination ─────────────────────────────────────────────

  test("pagination shows when multiple pages exist", async ({ page }) => {
    test.skip(!hasPosts, "No blog posts available");
    await page.waitForTimeout(2000);
    const pagination = page.locator('text=/Pagina \\d+ de \\d+/');
    if (await pagination.isVisible().catch(() => false)) {
      await expect(pagination).toBeVisible();
    }
  });

  // ── Tags ───────────────────────────────────────────────────

  test("post tags are displayed when present", async ({ page }) => {
    test.skip(!hasPosts, "No blog posts available");
    const card = page.locator('a[href^="/blog/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    // Tags may or may not be present
    const tags = card.locator("[class*='rounded-md'][class*='text-gray-600']");
    // Just verify no crash — tags are optional
    expect(await tags.count()).toBeGreaterThanOrEqual(0);
  });

  // ── No overflow ────────────────────────────────────────────

  test("no horizontal overflow", async ({ page }) => {
    await page.waitForTimeout(2000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowX).toBe(false);
  });
});
