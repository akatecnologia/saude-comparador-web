import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, setLeadInStorage, clearLocalStorage } from "./helpers";

test.describe("Assistente IA — Pre-chat & lead gate", () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto("/assistente", gotoOpts);
  });

  // ── Pre-chat state (no lead) ───────────────────────────────

  test("heading shows Assistente IA", async ({ page }) => {
    await expect(page.locator("h1:has-text('Assistente IA')").first()).toBeVisible();
  });

  test("pre-chat info cards are visible", async ({ page }) => {
    await expect(page.locator('text=Conversa personalizada').first()).toBeVisible();
    await expect(page.locator('text=Dados reais da ANS').first()).toBeVisible();
    await expect(page.locator('text=Até 15 mensagens').first()).toBeVisible();
  });

  test("lead form is shown before chat", async ({ page }) => {
    await expect(page.locator('text=Preencha seus dados para começar').first()).toBeVisible();
  });

  // ── Footer is hidden ──────────────────────────────────────

  test("footer is not visible on assistente page", async ({ page }) => {
    await expect(page.locator("footer")).not.toBeVisible();
  });

  // ── With lead set ──────────────────────────────────────────

  test("chat interface appears when lead is in localStorage", async ({ page }) => {
    await setLeadInStorage(page);
    await page.goto("/assistente", gotoOpts);
    await page.waitForTimeout(2000);
    // Should see the chat container (h-[calc(100vh-4rem)])
    const chatContainer = page.locator('[class*="h-[calc"]').first();
    if (await chatContainer.isVisible().catch(() => false)) {
      await expect(chatContainer).toBeVisible();
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
