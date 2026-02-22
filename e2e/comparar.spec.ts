import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, discoverCompareIds } from "./helpers";

let planIds: number[] = [];

test.beforeAll(async ({ browser }) => {
  planIds = await discoverCompareIds(browser);
});

test.describe("Comparar — Comparison table", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(planIds.length < 2, "Need at least 2 plan IDs");
    await page.goto(`/comparar?ids=${planIds.join(",")}`, gotoOpts);
    await page.locator("h1").first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  });

  test("page heading shows Comparar Planos", async ({ page }) => {
    await expect(page.locator("h1").first()).toContainText("Comparar Planos");
  });

  test("subtitle shows compare limit", async ({ page }) => {
    await expect(page.locator('text=Compare até 4 planos').first()).toBeVisible();
  });

  test("selected plans count is correct", async ({ page }) => {
    await expect(
      page.locator(`text=${planIds.length}/4 planos selecionados`).first(),
    ).toBeVisible();
  });

  test("comparison table is rendered with rows", async ({ page }) => {
    const table = page.locator("table");
    await table.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    const rows = table.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("comparison table contains key attributes", async ({ page }) => {
    const table = page.locator("table");
    await table.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    for (const label of ["Operadora", "Segmentação", "IDSS"]) {
      await expect(table.locator(`td:has-text("${label}")`).first()).toBeVisible();
    }
  });

  test("Remover button is shown per plan header", async ({ page }) => {
    const removeButtons = page.locator('button:has-text("Remover")');
    await removeButtons.first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    expect(await removeButtons.count()).toBe(planIds.length);
  });

  test("removing a plan updates the count", async ({ page }) => {
    const before = planIds.length;
    await page.locator('button:has-text("Remover")').first().click();
    await page.waitForTimeout(1500);
    const countText = page.locator(`text=${before - 1}/4 planos selecionados`).first();
    await expect(countText).toBeVisible();
  });

  test("Adicionar plano button appears when < 4 plans", async ({ page }) => {
    await expect(page.locator('button:has-text("Adicionar plano")').first()).toBeVisible();
  });

  test("faixa etária selector is visible", async ({ page }) => {
    await expect(page.locator('text=Faixa etária').first()).toBeVisible();
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.waitForTimeout(2000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflowX).toBe(false);
  });
});

test.describe("Comparar — Empty state", () => {
  test("shows empty state when no IDs", async ({ page }) => {
    await page.goto("/comparar", gotoOpts);
    await expect(page.locator('text=Nenhum plano selecionado').first()).toBeVisible();
    await expect(page.locator('a:has-text("Buscar planos")').first()).toBeVisible();
  });
});
