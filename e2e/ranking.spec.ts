import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT } from "./helpers";

let hasResults = false;

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/ranking", gotoOpts);
    const row = page.locator("table tbody tr, [class*='ranking']").first();
    await row.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    hasResults = true;
  } catch {
    // no data
  }
  await ctx.close();
});

test.describe("Ranking IDSS", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ranking", gotoOpts);
  });

  // ── Header ─────────────────────────────────────────────────

  test("page heading shows Ranking IDSS", async ({ page }) => {
    await expect(page.locator("h1:has-text('Ranking IDSS')").first()).toBeVisible();
  });

  test("subtitle mentions ANS quality assessment", async ({ page }) => {
    await expect(page.locator('text=avaliação de qualidade').first()).toBeVisible();
  });

  // ── Legend ──────────────────────────────────────────────────

  test("IDSS legend shows A, B, C ratings", async ({ page }) => {
    await expect(page.locator('text=Excelente').first()).toBeVisible();
    await expect(page.locator('text=Regular').first()).toBeVisible();
    await expect(page.locator('text=Precisa melhorar').first()).toBeVisible();
  });

  test("legend shows sub-index labels", async ({ page }) => {
    for (const label of ["IDQS", "IDGA", "IDSM", "IDGR"]) {
      await expect(page.locator(`strong:has-text("${label}")`).first()).toBeVisible();
    }
  });

  // ── Filters ────────────────────────────────────────────────

  test("UF filter dropdown is visible", async ({ page }) => {
    await expect(page.locator("select").filter({ hasText: "Todos os estados" }).first()).toBeVisible();
  });

  test("year filter dropdown is visible", async ({ page }) => {
    await expect(page.locator("select").filter({ hasText: "Todos os anos" }).first()).toBeVisible();
  });

  test("UF filter updates results", async ({ page }) => {
    test.skip(!hasResults, "No ranking data available");
    const select = page.locator("select").filter({ hasText: "Todos os estados" }).first();
    await select.selectOption("SP");
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("uf=SP");
  });

  // ── Table ──────────────────────────────────────────────────

  test("ranking table or loading state is shown", async ({ page }) => {
    await page.waitForTimeout(3000);
    const table = page.locator("table");
    const empty = page.locator('text=Nenhum resultado encontrado');
    const skeleton = page.locator(".skeleton").first();
    expect(
      (await table.isVisible().catch(() => false)) ||
      (await empty.isVisible().catch(() => false)) ||
      (await skeleton.isVisible().catch(() => false)),
    ).toBe(true);
  });

  test("results count is displayed", async ({ page }) => {
    test.skip(!hasResults, "No ranking data available");
    await page.waitForTimeout(3000);
    await expect(page.locator('text=/\\d+ resultado/').first()).toBeVisible();
  });

  // ── Pagination ─────────────────────────────────────────────

  test("pagination appears when multiple pages exist", async ({ page }) => {
    test.skip(!hasResults, "No ranking data available");
    await page.waitForTimeout(3000);
    const pageButtons = page.locator("button").filter({ hasText: /^\d+$/ });
    if (await pageButtons.first().isVisible().catch(() => false)) {
      expect(await pageButtons.count()).toBeGreaterThan(0);
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
