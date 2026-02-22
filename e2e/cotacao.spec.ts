import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT } from "./helpers";

test.describe("Cotação — Lead form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cotacao", gotoOpts);
  });

  // ── Header ─────────────────────────────────────────────────

  test("page heading shows Solicitar Cotação", async ({ page }) => {
    await expect(page.locator("h1:has-text('Solicitar Cotação')").first()).toBeVisible();
  });

  test("page subtitle describes the purpose", async ({ page }) => {
    await expect(page.locator('text=cotações personalizadas').first()).toBeVisible();
  });

  // ── Form fields ────────────────────────────────────────────

  test("form has required fields", async ({ page }) => {
    await expect(page.locator('label:has-text("Nome completo")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Email")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Estado")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Faixa etária")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Tipo de contratação")').first()).toBeVisible();
  });

  test("submit button is visible", async ({ page }) => {
    await expect(page.locator('button:has-text("Continuar")').first()).toBeVisible();
  });

  test("LGPD consent checkbox is visible", async ({ page }) => {
    await expect(page.locator('text=Termos de Uso').first()).toBeVisible();
    await expect(page.locator('text=Política de Privacidade').first()).toBeVisible();
  });

  // ── Client-side validation ─────────────────────────────────

  test("submitting empty form shows validation errors", async ({ page }) => {
    await page.locator('button:has-text("Continuar")').first().click();
    // Should show multiple error messages
    await expect(page.locator('text=Nome é obrigatório').first()).toBeVisible();
    await expect(page.locator('text=Selecione o estado').first()).toBeVisible();
    await expect(page.locator('text=Selecione a faixa etária').first()).toBeVisible();
  });

  test("invalid email shows error message", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("invalid-email");
    await page.locator('button:has-text("Continuar")').first().click();
    await expect(page.locator('text=Email inválido').first()).toBeVisible();
  });

  test("filling a field clears its error", async ({ page }) => {
    await page.locator('button:has-text("Continuar")').first().click();
    await expect(page.locator('text=Nome é obrigatório').first()).toBeVisible();
    const nameInput = page.locator('input[placeholder="Seu nome"]').first();
    await nameInput.fill("João");
    await expect(page.locator('text=Nome é obrigatório')).not.toBeVisible();
  });

  test("LGPD checkbox error appears when unchecked", async ({ page }) => {
    await page.locator('button:has-text("Continuar")').first().click();
    await expect(page.locator('text=Você precisa aceitar os termos').first()).toBeVisible();
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
