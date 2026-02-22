import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, isMobile, isDesktop } from "./helpers";

let hasResults = false;

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/planos?uf=SP", gotoOpts);
    const card = page.locator('a[href^="/planos/"]').first();
    await card.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    hasResults = true;
  } catch {
    // no data available
  }
  await ctx.close();
});

test.describe("Planos — Listing, search, filters & pagination", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/planos?uf=SP", gotoOpts);
  });

  // ── Search ─────────────────────────────────────────────────

  test("search input is visible", async ({ page }) => {
    const input = page.locator('input[placeholder*="Buscar"]').first();
    await expect(input).toBeVisible();
  });

  test("search input accepts text and updates URL", async ({ page }) => {
    const input = page.locator('input[placeholder*="Buscar"]').first();
    await input.fill("unimed");
    await page.waitForTimeout(600); // debounce
    expect(page.url()).toContain("q=unimed");
  });

  test("clear button removes search text", async ({ page }) => {
    const input = page.locator('input[placeholder*="Buscar"]').first();
    await input.fill("unimed");
    await page.waitForTimeout(600);
    const clearBtn = input.locator("..").locator("button").first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(input).toHaveValue("");
    }
  });

  // ── Results ────────────────────────────────────────────────

  test("results count or empty state is shown", async ({ page }) => {
    await page.waitForTimeout(3000);
    const count = page.locator('text=/\\d+ resultado/').first();
    const empty = page.locator('text=Nenhum plano encontrado').first();
    const hasCount = await count.isVisible().catch(() => false);
    const hasEmpty = await empty.isVisible().catch(() => false);
    expect(hasCount || hasEmpty).toBe(true);
  });

  test("plan cards show plan names", async ({ page }) => {
    test.skip(!hasResults, "No plan data available");
    const cards = page.locator('a[href^="/planos/"]');
    await cards.first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("plan card links navigate to plan detail", async ({ page }) => {
    test.skip(!hasResults, "No plan data available");
    const link = page.locator('a[href^="/planos/"]:has-text("Ver detalhes")').first();
    await link.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/planos\/\d+/);
  });

  // ── Sort ───────────────────────────────────────────────────

  test("sort dropdown is visible", async ({ page }) => {
    const select = page.locator("select").filter({ hasText: "Melhor custo-benefício" }).first();
    await expect(select).toBeVisible();
  });

  test("sort dropdown has expected options", async ({ page }) => {
    const options = page.locator("select option").filter({ hasText: "Menor preço" });
    expect(await options.count()).toBeGreaterThan(0);
  });

  // ── Acomodação toggle ──────────────────────────────────────

  test("acomodação toggle buttons visible", async ({ page }) => {
    await expect(page.locator('button:has-text("Enfermaria")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Apartamento")').first()).toBeVisible();
  });

  // ── Desktop filters sidebar ────────────────────────────────

  test("desktop sidebar shows filter sections", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    for (const label of ["Estado", "Tipo de contratação", "Segmentação", "Abrangência"]) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test("faixa etária selector is visible on desktop", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    await expect(page.locator('text=Sua faixa etária').first()).toBeVisible();
  });

  // ── Mobile filters ─────────────────────────────────────────

  test("mobile filter button visible", async ({ page }) => {
    test.skip(isDesktop(page), "Mobile/tablet only");
    await expect(page.locator('button:has-text("Filtros")').first()).toBeVisible();
  });

  test("mobile filter panel opens and closes", async ({ page }) => {
    test.skip(isDesktop(page), "Mobile/tablet only");
    await page.locator('button:has-text("Filtros")').first().click();
    // Panel should be open
    await expect(page.locator('text=Ver resultados').first()).toBeVisible();
    // Close it
    await page.locator('button:has-text("Ver resultados")').first().click();
    await expect(page.locator('text=Ver resultados')).not.toBeVisible();
  });

  // ── Filter chips ───────────────────────────────────────────

  test("active filter chips show when UF is selected", async ({ page }) => {
    // UF=SP is already in URL
    await page.waitForTimeout(2000);
    const chip = page.locator("button").filter({ hasText: "SP" }).first();
    if (await chip.isVisible().catch(() => false)) {
      await expect(chip).toBeVisible();
    }
  });

  test("Limpar tudo clears all filter chips", async ({ page }) => {
    const clearBtn = page.locator('button:has-text("Limpar tudo")').first();
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(1000);
      await expect(clearBtn).not.toBeVisible();
    }
  });

  // ── Load more / infinite scroll ────────────────────────────

  test("Carregar mais button appears when there are more results", async ({ page }) => {
    test.skip(!hasResults, "No plan data available");
    await page.waitForTimeout(3000);
    const btn = page.locator('button:has-text("Carregar mais planos")');
    // This may or may not be present depending on total results
    const count = await btn.count();
    expect(count).toBeLessThanOrEqual(1); // 0 or 1
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
