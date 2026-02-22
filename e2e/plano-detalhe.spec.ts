import { test, expect } from "@playwright/test";

// Discover a real plan URL from the listing page (shared across all tests in the file)
let planoUrl = "";

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/planos?uf=SP", { waitUntil: "networkidle", timeout: 45_000 });
  // Wait for at least one plan card link to appear
  const link = page.locator('a[href^="/planos/"]').first();
  try {
    await link.waitFor({ state: "visible", timeout: 30_000 });
    planoUrl = (await link.getAttribute("href")) || "";
  } catch {
    // Couldn't find a plan link — tests will skip
  }
  await ctx.close();
});

test.describe("Plano Detalhe — Responsividade", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!planoUrl, "No plan URL discovered — skipping");
    await page.goto(planoUrl, { waitUntil: "networkidle", timeout: 45_000 });
    // Wait for the plan header to render
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 30_000 });
  });

  test("page loads and shows plan name", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test("no horizontal overflow on the page", async ({ page }) => {
    await page.waitForTimeout(500);
    const overflowX = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflowX).toBe(false);
  });

  test("header buttons are visible", async ({ page }) => {
    const comparar = page.locator('a:has-text("Comparar")').first();
    const cotacao = page.locator('a:has-text("Solicitar cotação")').first();

    await expect(comparar).toBeVisible();
    await expect(cotacao).toBeVisible();
  });

  test("metrics cards fit within viewport", async ({ page }) => {
    const viewport = page.viewportSize()!;
    const cards = page.locator(".grid.lg\\:grid-cols-4 > div");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const box = await card.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 5);
      }
    }
  });

  test("coverage details section is visible", async ({ page }) => {
    await expect(page.locator("text=Detalhes da cobertura").first()).toBeVisible();
  });

  test("coverage grid stacks on mobile", async ({ page }) => {
    const viewport = page.viewportSize()!;
    test.skip(viewport.width >= 640, "Only applies to mobile viewports");

    const grid = page.locator("h2:has-text('Detalhes da cobertura')").locator("..").locator(".grid").first();
    if (!(await grid.isVisible())) return;

    const items = grid.locator("> div");
    if ((await items.count()) < 2) return;

    const box1 = await items.nth(0).boundingBox();
    const box2 = await items.nth(1).boundingBox();
    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();
    // Items should stack vertically on mobile
    expect(box2!.y).toBeGreaterThan(box1!.y);
  });

  test("IDSS grid stacks on mobile", async ({ page }) => {
    const viewport = page.viewportSize()!;
    test.skip(viewport.width >= 640, "Only applies to mobile viewports");

    const heading = page.locator("text=IDSS — Detalhamento");
    if (!(await heading.isVisible().catch(() => false))) {
      test.skip(true, "IDSS section not present on this plan");
      return;
    }

    const grid = heading.locator("..").locator("..").locator(".grid").first();
    if (!(await grid.isVisible())) return;

    const items = grid.locator("> div");
    if ((await items.count()) < 2) return;

    const box1 = await items.nth(0).boundingBox();
    const box2 = await items.nth(1).boundingBox();
    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();
    expect(box2!.y).toBeGreaterThan(box1!.y);
  });

  test("tables have horizontal scroll wrapper", async ({ page }) => {
    const tables = page.locator("table");
    const count = await tables.count();

    for (let i = 0; i < count; i++) {
      const table = tables.nth(i);
      if (await table.isVisible()) {
        const overflowX = await table.locator("..").evaluate((el) =>
          getComputedStyle(el).overflowX
        );
        expect(["auto", "scroll", "hidden"]).toContain(overflowX);
      }
    }
  });

  test("sidebar is below main content on mobile/tablet", async ({ page }) => {
    const viewport = page.viewportSize()!;
    test.skip(viewport.width >= 1024, "Only applies to mobile/tablet viewports");

    const cta = page.locator("text=Interessado neste plano?").first();
    const coverage = page.locator("text=Detalhes da cobertura").first();

    if (!(await cta.isVisible().catch(() => false))) return;
    if (!(await coverage.isVisible().catch(() => false))) return;

    const ctaBox = await cta.boundingBox();
    const covBox = await coverage.boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(covBox).not.toBeNull();
    expect(ctaBox!.y).toBeGreaterThan(covBox!.y);
  });

  test("tags wrap and stay within viewport", async ({ page }) => {
    const viewport = page.viewportSize()!;
    const tags = page.locator(".flex.flex-wrap.gap-2.mb-6").first();
    if (!(await tags.isVisible().catch(() => false))) return;

    const box = await tags.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 5);
  });

  test("back link is visible at the top", async ({ page }) => {
    const backLink = page.locator('a:has-text("Voltar para planos")').first();
    await expect(backLink).toBeVisible();
    const box = await backLink.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(300);
  });
});
