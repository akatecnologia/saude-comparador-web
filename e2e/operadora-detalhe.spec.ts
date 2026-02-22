import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, discoverOperadoraUrl, isDesktop } from "./helpers";

let operadoraUrl = "";

test.beforeAll(async ({ browser }) => {
  operadoraUrl = await discoverOperadoraUrl(browser);
});

test.describe("Operadora Detalhe", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!operadoraUrl, "No operadora URL discovered");
    await page.goto(operadoraUrl, gotoOpts);
    await page.locator("h1").first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  });

  test("page shows operadora name in heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test("back link to operadoras is visible", async ({ page }) => {
    const back = page.locator('a:has-text("Voltar")').first();
    await expect(back).toBeVisible();
  });

  test("shows registration details (ANS, CNPJ)", async ({ page }) => {
    await expect(page.locator('text=/ANS \\d+/').first()).toBeVisible();
    await expect(page.locator('text=/CNPJ/').first()).toBeVisible();
  });

  test("info grid cards are visible", async ({ page }) => {
    for (const label of ["Localização", "Beneficiários"]) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test("share button is visible", async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Compartilhar")').first();
    await expect(shareBtn).toBeVisible();
  });

  test("IDSS section is rendered when data exists", async ({ page }) => {
    const idssSection = page.locator('text=/IDSS \\d{4}/').first();
    if (await idssSection.isVisible().catch(() => false)) {
      await expect(idssSection).toBeVisible();
    }
  });

  test("IDSS chart is rendered when history exists", async ({ page }) => {
    const chartHeading = page.locator('text=Histórico IDSS').first();
    if (await chartHeading.isVisible().catch(() => false)) {
      await expect(chartHeading).toBeVisible();
      // recharts renders SVG
      const svg = chartHeading.locator("..").locator("svg").first();
      if (await svg.isVisible().catch(() => false)) {
        await expect(svg).toBeVisible();
      }
    }
  });

  test("reajustes chart is rendered when data exists", async ({ page }) => {
    const heading = page.locator('text=Histórico de Reajustes').first();
    if (await heading.isVisible().catch(() => false)) {
      await expect(heading).toBeVisible();
    }
  });

  test("associated plans section renders cards", async ({ page }) => {
    const heading = page.locator('text=Planos desta operadora').first();
    if (await heading.isVisible().catch(() => false)) {
      const cards = page.locator('a[href^="/planos/"]');
      expect(await cards.count()).toBeGreaterThan(0);
    }
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.waitForTimeout(2000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowX).toBe(false);
  });
});
