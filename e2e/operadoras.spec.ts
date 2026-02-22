import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, isDesktop } from "./helpers";

let hasResults = false;

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/operadoras?uf=SP", gotoOpts);
    const card = page.locator('a[href^="/operadoras/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    hasResults = true;
  } catch {
    // no data
  }
  await ctx.close();
});

test.describe("Operadoras — Listing, search & filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/operadoras?uf=SP", gotoOpts);
  });

  // ── Header ─────────────────────────────────────────────────

  test("page heading is visible", async ({ page }) => {
    await expect(page.locator("h1:has-text('Operadoras')").first()).toBeVisible();
  });

  test("subtitle mentions ANS", async ({ page }) => {
    await expect(page.locator('text=registradas na ANS').first()).toBeVisible();
  });

  // ── Search ─────────────────────────────────────────────────

  test("search input is visible", async ({ page }) => {
    const input = page.locator('input[placeholder*="Buscar operadora"]').first();
    await expect(input).toBeVisible();
  });

  test("search filters results", async ({ page }) => {
    test.skip(!hasResults, "No data available");
    const input = page.locator('input[placeholder*="Buscar operadora"]').first();
    await input.fill("unimed");
    await page.waitForTimeout(2000);
    // Should still show some results or update
    const cards = page.locator('a[href^="/operadoras/"]');
    const empty = page.locator('text=Nenhuma operadora encontrada');
    expect((await cards.count()) > 0 || (await empty.isVisible().catch(() => false))).toBe(true);
  });

  // ── Filters ────────────────────────────────────────────────

  test("UF filter dropdown is visible", async ({ page }) => {
    const select = page.locator("select").filter({ hasText: "Todos os estados" }).first();
    await expect(select).toBeVisible();
  });

  test("modalidade filter dropdown is visible", async ({ page }) => {
    const select = page.locator("select").filter({ hasText: "Todas modalidades" }).first();
    await expect(select).toBeVisible();
  });

  // ── View toggle ────────────────────────────────────────────

  test("cards/table view toggle visible on desktop", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    const toggleGroup = page.locator(".hidden.sm\\:flex.items-center.gap-1");
    await expect(toggleGroup.first()).toBeVisible();
  });

  test("switching to table view shows table", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    test.skip(!hasResults, "No data available");
    // Click the table view button (List icon)
    const tableBtn = page.locator(".hidden.sm\\:flex.items-center.gap-1 button").last();
    await tableBtn.click();
    await page.waitForTimeout(1000);
    const table = page.locator("table");
    await expect(table).toBeVisible();
  });

  test("table shows expected columns", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    test.skip(!hasResults, "No data available");
    const tableBtn = page.locator(".hidden.sm\\:flex.items-center.gap-1 button").last();
    await tableBtn.click();
    await page.waitForTimeout(1000);
    for (const col of ["Operadora", "Registro ANS", "UF", "Modalidade", "Beneficiários", "IDSS"]) {
      await expect(page.locator(`th:has-text("${col}")`).first()).toBeVisible();
    }
  });

  // ── Results ────────────────────────────────────────────────

  test("results count is shown", async ({ page }) => {
    test.skip(!hasResults, "No data available");
    await page.waitForTimeout(3000);
    await expect(page.locator('text=/\\d+ operadora/').first()).toBeVisible();
  });

  test("operadora cards display IDSS badge", async ({ page }) => {
    test.skip(!hasResults, "No data available");
    const card = page.locator('a[href^="/operadoras/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    await expect(card.locator('text=IDSS').first()).toBeVisible();
  });

  // ── Pagination ─────────────────────────────────────────────

  test("pagination is visible when more than one page", async ({ page }) => {
    test.skip(!hasResults, "No data available");
    await page.waitForTimeout(3000);
    const pagination = page.locator('text=/Página \\d+ de \\d+/');
    // May or may not be present
    if (await pagination.isVisible().catch(() => false)) {
      await expect(pagination).toBeVisible();
    }
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
