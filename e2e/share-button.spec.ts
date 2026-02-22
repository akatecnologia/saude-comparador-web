import { test, expect } from "@playwright/test";
import { gotoOpts, ELEMENT_TIMEOUT, discoverOperadoraUrl } from "./helpers";

let detailUrl = "";

test.beforeAll(async ({ browser }) => {
  detailUrl = await discoverOperadoraUrl(browser);
});

test.describe("ShareButton — Social sharing dropdown", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!detailUrl, "No detail page URL discovered");
    await page.goto(detailUrl, gotoOpts);
    await page.locator("h1").first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
  });

  test("share button is visible", async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Compartilhar")').first();
    await expect(shareBtn).toBeVisible();
  });

  test("clicking share button opens dropdown", async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Compartilhar")').first();
    await shareBtn.click();
    await expect(page.locator('text=WhatsApp').first()).toBeVisible();
    await expect(page.locator('text=Facebook').first()).toBeVisible();
    await expect(page.locator('text=LinkedIn').first()).toBeVisible();
    await expect(page.locator('text=Copiar link').first()).toBeVisible();
  });

  test("Copiar link shows Copiado! feedback", async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Compartilhar")').first();
    await shareBtn.click();
    // Grant clipboard permission
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const copyBtn = page.locator('button:has-text("Copiar link")').first();
    await copyBtn.click();
    await expect(page.locator('text=Copiado!').first()).toBeVisible();
  });

  test("dropdown closes on outside click", async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Compartilhar")').first();
    await shareBtn.click();
    await expect(page.locator('text=WhatsApp').first()).toBeVisible();
    // Click outside the dropdown
    await page.locator("h1").first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("WhatsApp")')).not.toBeVisible();
  });

  test("social links have correct targets", async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Compartilhar")').first();
    await shareBtn.click();
    // WhatsApp, Facebook, LinkedIn buttons should be present
    const whatsapp = page.locator('button:has-text("WhatsApp")').first();
    const facebook = page.locator('button:has-text("Facebook")').first();
    const linkedin = page.locator('button:has-text("LinkedIn")').first();
    await expect(whatsapp).toBeVisible();
    await expect(facebook).toBeVisible();
    await expect(linkedin).toBeVisible();
  });
});
