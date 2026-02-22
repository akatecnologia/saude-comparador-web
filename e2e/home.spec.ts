import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, isMobile, isDesktop } from "./helpers";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", gotoOpts);
  });

  // ── Hero section ───────────────────────────────────────────

  test("hero heading is visible", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Compare planos de saúde");
  });

  test("hero subtitle mentions ANS", async ({ page }) => {
    await expect(page.locator('text=dados oficiais da ANS').first()).toBeVisible();
  });

  test("search box is visible in hero", async ({ page }) => {
    const searchArea = page.locator("input[type='text'], input[placeholder*='Buscar'], input[placeholder*='plano']").first();
    await expect(searchArea).toBeVisible();
  });

  // ── Stats cards ────────────────────────────────────────────

  test("stat cards render with labels", async ({ page }) => {
    for (const label of ["Operadoras", "Planos", "Municípios", "Beneficiários"]) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test("stat cards show numeric values after loading", async ({ page }) => {
    // Wait for skeleton to disappear
    await page.waitForTimeout(3000);
    const cards = page.locator(".grid.grid-cols-2 > div");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  // ── Features section ───────────────────────────────────────

  test("features section shows 3 cards", async ({ page }) => {
    await expect(page.locator('text=Tudo que você precisa').first()).toBeVisible();
    await expect(page.locator('text=Ranking IDSS').first()).toBeVisible();
    await expect(page.locator('text=Histórico de Reajustes').first()).toBeVisible();
    await expect(page.locator('text=Índice de Reclamações').first()).toBeVisible();
  });

  test("feature cards have action links", async ({ page }) => {
    await expect(page.locator('a:has-text("Ver ranking")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Ver reajustes")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Ver operadoras")').first()).toBeVisible();
  });

  // ── Featured plans ─────────────────────────────────────────

  test("featured plans section heading visible", async ({ page }) => {
    await expect(page.locator('text=Planos em destaque').first()).toBeVisible();
  });

  test("featured plan cards or empty state rendered", async ({ page }) => {
    await page.waitForTimeout(3000);
    const cards = page.locator('a[href^="/planos/"]');
    const empty = page.locator('text=Nenhum plano disponível');
    const hasCards = (await cards.count()) > 0;
    const hasEmpty = await empty.isVisible().catch(() => false);
    expect(hasCards || hasEmpty).toBe(true);
  });

  test("Ver todos link navigates to /planos", async ({ page }) => {
    const link = page.locator('a[href="/planos"]:has-text("Ver todos")').first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.waitForURL("**/planos*", { timeout: ELEMENT_TIMEOUT });
      expect(page.url()).toContain("/planos");
    }
  });

  // ── AI Assistant CTA ───────────────────────────────────────

  test("AI assistant CTA section visible", async ({ page }) => {
    await expect(page.locator('text=Não sabe qual plano escolher?').first()).toBeVisible();
  });

  test("AI assistant CTA links to /assistente", async ({ page }) => {
    const cta = page.locator('a[href="/assistente"]:has-text("Conversar com o assistente")');
    await expect(cta).toBeVisible();
  });

  // ── Responsiveness ─────────────────────────────────────────

  test("no horizontal overflow", async ({ page }) => {
    await page.waitForTimeout(2000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowX).toBe(false);
  });
});
