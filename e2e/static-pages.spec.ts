import { test, expect } from "@playwright/test";
import { gotoOpts } from "./helpers";

test.describe("Static pages — Termos & Privacidade", () => {
  // ── Termos de Uso ──────────────────────────────────────────

  test("termos page loads with heading", async ({ page }) => {
    await page.goto("/termos", gotoOpts);
    await expect(page.locator("h1:has-text('Termos de Uso')").first()).toBeVisible();
  });

  test("termos page shows last update date", async ({ page }) => {
    await page.goto("/termos", gotoOpts);
    await expect(page.locator('text=Última atualização').first()).toBeVisible();
  });

  test("termos page has no horizontal overflow", async ({ page }) => {
    await page.goto("/termos", gotoOpts);
    await page.waitForTimeout(1000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowX).toBe(false);
  });

  // ── Política de Privacidade ────────────────────────────────

  test("privacidade page loads with heading", async ({ page }) => {
    await page.goto("/privacidade", gotoOpts);
    await expect(page.locator("h1:has-text('Política de Privacidade')").first()).toBeVisible();
  });

  test("privacidade page shows last update date", async ({ page }) => {
    await page.goto("/privacidade", gotoOpts);
    await expect(page.locator('text=Última atualização').first()).toBeVisible();
  });

  test("privacidade page has no horizontal overflow", async ({ page }) => {
    await page.goto("/privacidade", gotoOpts);
    await page.waitForTimeout(1000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowX).toBe(false);
  });
});
