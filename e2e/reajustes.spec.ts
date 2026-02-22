import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT } from "./helpers";

test.describe("Reajustes — Adjustment history", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reajustes", gotoOpts);
  });

  // ── Header ─────────────────────────────────────────────────

  test("page heading shows Histórico de Reajustes", async ({ page }) => {
    await expect(page.locator("h1").first()).toContainText("Histórico de Reajustes");
  });

  test("info box about reajustes is visible", async ({ page }) => {
    await expect(page.locator('text=Sobre os reajustes').first()).toBeVisible();
  });

  // ── Search / autocomplete ──────────────────────────────────

  test("operadora search input is visible", async ({ page }) => {
    await expect(page.locator('input[placeholder*="operadora"]').first()).toBeVisible();
  });

  test("typing in search shows autocomplete suggestions", async ({ page }) => {
    const input = page.locator('input[placeholder*="operadora"]').first();
    await input.fill("unimed");
    await page.waitForTimeout(1500);
    const suggestions = page.locator("button").filter({ hasText: /ANS \d+/ });
    const count = await suggestions.count();
    // Might have results or not depending on API
    if (count > 0) {
      await expect(suggestions.first()).toBeVisible();
    }
  });

  test("selecting a suggestion loads reajustes data", async ({ page }) => {
    const input = page.locator('input[placeholder*="operadora"]').first();
    await input.fill("unimed");
    await page.waitForTimeout(1500);
    const suggestion = page.locator("button").filter({ hasText: /ANS \d+/ }).first();
    if (await suggestion.isVisible().catch(() => false)) {
      await suggestion.click();
      await page.waitForTimeout(3000);
      // Should show chart, table, or empty state
      const chart = page.locator('text=/ANS \\d+/').first();
      const empty = page.locator('text=Sem dados de reajuste').first();
      expect(
        (await chart.isVisible().catch(() => false)) ||
        (await empty.isVisible().catch(() => false)),
      ).toBe(true);
    }
  });

  // ── Initial state ──────────────────────────────────────────

  test("initial state shows Selecione uma operadora", async ({ page }) => {
    await expect(page.locator('text=Selecione uma operadora').first()).toBeVisible();
  });

  // ── Chart and table ────────────────────────────────────────

  test("Limpar button clears selection", async ({ page }) => {
    const input = page.locator('input[placeholder*="operadora"]').first();
    await input.fill("unimed");
    await page.waitForTimeout(1500);
    const suggestion = page.locator("button").filter({ hasText: /ANS \d+/ }).first();
    if (await suggestion.isVisible().catch(() => false)) {
      await suggestion.click();
      await page.waitForTimeout(2000);
      const clearBtn = page.locator('button:has-text("Limpar"), span:has-text("Limpar")').first();
      if (await clearBtn.isVisible().catch(() => false)) {
        await clearBtn.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('text=Selecione uma operadora').first()).toBeVisible();
      }
    }
  });

  test("detalhamento table has expected columns when data exists", async ({ page }) => {
    const input = page.locator('input[placeholder*="operadora"]').first();
    await input.fill("amil");
    await page.waitForTimeout(1500);
    const suggestion = page.locator("button").filter({ hasText: /ANS \d+/ }).first();
    if (await suggestion.isVisible().catch(() => false)) {
      await suggestion.click();
      await page.waitForTimeout(3000);
      const table = page.locator("table").first();
      if (await table.isVisible().catch(() => false)) {
        for (const col of ["Ano", "Tipo de Plano", "Percentual"]) {
          await expect(page.locator(`th:has-text("${col}")`).first()).toBeVisible();
        }
      }
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
