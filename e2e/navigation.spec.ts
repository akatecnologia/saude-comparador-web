import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, isMobile, isDesktop } from "./helpers";

test.describe("Navigation — Navbar, menu & footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", gotoOpts);
  });

  // ── Brand / Logo ───────────────────────────────────────────

  test("brand logo links to home", async ({ page }) => {
    const brand = page.locator('a[href="/"]').filter({ hasText: "SaúdeComparador" }).first();
    await expect(brand).toBeVisible();
  });

  // ── Desktop nav links ──────────────────────────────────────

  test("desktop nav shows all links", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    const nav = page.locator("header nav");
    for (const label of ["Planos", "Ranking", "Reajustes", "Operadoras", "Assistente IA"]) {
      await expect(nav.locator(`a:has-text("${label}")`).first()).toBeVisible();
    }
  });

  test("desktop nav links navigate correctly", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    const links: [string, string][] = [
      ["Planos", "/planos"],
      ["Ranking", "/ranking"],
      ["Reajustes", "/reajustes"],
      ["Operadoras", "/operadoras"],
    ];
    for (const [label, path] of links) {
      await page.locator(`header a:has-text("${label}")`).first().click();
      await page.waitForURL(`**${path}*`, { timeout: ELEMENT_TIMEOUT });
      expect(page.url()).toContain(path);
      await page.goto("/", gotoOpts);
    }
  });

  test("Dados ANS atualizados badge visible on desktop", async ({ page }) => {
    test.skip(!isDesktop(page), "Desktop only");
    await expect(page.locator('text=Dados ANS atualizados').first()).toBeVisible();
  });

  // ── Mobile menu ────────────────────────────────────────────

  test("hamburger menu button visible on mobile/tablet", async ({ page }) => {
    test.skip(isDesktop(page), "Mobile/tablet only");
    const btn = page.locator('button[aria-label="Abrir menu"]');
    await expect(btn).toBeVisible();
  });

  test("hamburger menu opens and shows nav links", async ({ page }) => {
    test.skip(isDesktop(page), "Mobile/tablet only");
    await page.locator('button[aria-label="Abrir menu"]').click();
    for (const label of ["Planos", "Ranking", "Reajustes", "Operadoras", "Assistente IA"]) {
      await expect(page.locator(`a:has-text("${label}")`).first()).toBeVisible();
    }
  });

  test("hamburger menu closes on link click", async ({ page }) => {
    test.skip(isDesktop(page), "Mobile/tablet only");
    await page.locator('button[aria-label="Abrir menu"]').click();
    await page.locator('a:has-text("Planos")').first().click();
    await page.waitForURL("**/planos*", { timeout: ELEMENT_TIMEOUT });
    // Menu should close (body overflow restored)
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("");
  });

  test("hamburger menu closes on backdrop click", async ({ page }) => {
    test.skip(isDesktop(page), "Mobile/tablet only");
    await page.locator('button[aria-label="Abrir menu"]').click();
    // Click on the backdrop (bg-black/20 overlay)
    await page.locator(".bg-black\\/20").click();
    // Links should no longer be in the mobile panel
    await expect(page.locator(".lg\\:hidden.fixed a:has-text('Planos')")).not.toBeVisible();
  });

  // ── Footer ─────────────────────────────────────────────────

  test("footer is visible on home page", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("footer contains navigation links", async ({ page }) => {
    const footer = page.locator("footer");
    for (const text of ["Buscar Planos", "Ranking IDSS", "Operadoras", "Termos de Uso", "Política de Privacidade"]) {
      await expect(footer.locator(`a:has-text("${text}")`).first()).toBeVisible();
    }
  });

  test("footer shows Goworks attribution", async ({ page }) => {
    await expect(page.locator('footer a:has-text("Goworks Tecnologia")')).toBeVisible();
  });

  test("footer is hidden on /assistente when chat active", async ({ page }) => {
    await page.goto("/assistente", gotoOpts);
    // On assistente page, footer should not be rendered
    await expect(page.locator("footer")).not.toBeVisible();
  });
});
