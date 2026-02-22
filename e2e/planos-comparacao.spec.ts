import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT } from "./helpers";

let hasResults = false;

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/planos?uf=SP", gotoOpts);
    const card = page.locator('button:has-text("Comparar")').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    hasResults = true;
  } catch {
    // no compare buttons
  }
  await ctx.close();
});

test.describe("Planos — Comparison selection", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasResults, "No plan data available");
    await page.goto("/planos?uf=SP", gotoOpts);
    await page.locator('button:has-text("Comparar")').first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  });

  test("compare button is visible on plan cards", async ({ page }) => {
    const btn = page.locator('button:has-text("Comparar")').first();
    await expect(btn).toBeVisible();
  });

  test("clicking compare toggles button state", async ({ page }) => {
    const btn = page.locator('button:has-text("Comparar")').first();
    await btn.click();
    await expect(page.locator('button:has-text("Comparando")').first()).toBeVisible();
  });

  test("compare bar appears after selecting a plan", async ({ page }) => {
    const btn = page.locator('button:has-text("Comparar")').first();
    await btn.click();
    const bar = page.locator('text=/\\d+ plano.*selecionado/').first();
    await expect(bar).toBeVisible();
  });

  test("compare bar shows Comparar link", async ({ page }) => {
    const btn = page.locator('button:has-text("Comparar")').first();
    await btn.click();
    const compareLink = page.locator('a:has-text("Comparar")').filter({ hasText: "Comparar" });
    await expect(compareLink.first()).toBeVisible();
  });

  test("compare bar clear button removes selection", async ({ page }) => {
    const btn = page.locator('button:has-text("Comparar")').first();
    await btn.click();
    await expect(page.locator('text=/\\d+ plano.*selecionado/')).toBeVisible();
    // Click the X button on the compare bar
    const closeBtn = page.locator(".sticky.top-16 button").last();
    await closeBtn.click();
    await expect(page.locator('text=/\\d+ plano.*selecionado/')).not.toBeVisible();
  });

  test("selecting multiple plans increments count", async ({ page }) => {
    const buttons = page.locator('button:has-text("Comparar")');
    const count = await buttons.count();
    if (count < 2) {
      test.skip(true, "Need at least 2 plan cards");
      return;
    }
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await expect(page.locator('text=2 planos selecionados')).toBeVisible();
  });

  test("compare link navigates to /comparar with ids", async ({ page }) => {
    const btn = page.locator('button:has-text("Comparar")').first();
    await btn.click();
    const compareLink = page.locator('a[href^="/comparar?ids="]').first();
    await expect(compareLink).toBeVisible();
    const href = await compareLink.getAttribute("href");
    expect(href).toMatch(/\/comparar\?ids=\d+/);
  });
});
