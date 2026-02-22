import type { Page, BrowserContext } from "@playwright/test";

// ── Timeouts ─────────────────────────────────────────────────
export const GOTO_TIMEOUT = 45_000;
export const ELEMENT_TIMEOUT = 30_000;

export const gotoOpts = { waitUntil: "networkidle" as const, timeout: GOTO_TIMEOUT };

// ── Viewport helpers ─────────────────────────────────────────
export function isMobile(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 640;
}

export function isTablet(page: Page): boolean {
  const w = page.viewportSize()?.width ?? 1280;
  return w >= 640 && w < 1024;
}

export function isDesktop(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) >= 1024;
}

// ── Lead / localStorage helpers ──────────────────────────────
export const LEAD_KEYS = {
  id: "saude_lead_id",
  nome: "saude_lead_nome",
  uf: "saude_lead_uf",
  faixa: "saude_lead_faixa",
  tipo: "saude_lead_tipo",
} as const;

export async function setLeadInStorage(page: Page) {
  await page.evaluate((keys) => {
    localStorage.setItem(keys.id, "e2e-test-lead-id");
    localStorage.setItem(keys.nome, "Teste E2E");
    localStorage.setItem(keys.uf, "SP");
    localStorage.setItem(keys.faixa, "29 a 33 anos");
    localStorage.setItem(keys.tipo, "Individual ou familiar");
  }, LEAD_KEYS);
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

// ── URL discovery helpers ────────────────────────────────────

/** Discover a real plan detail URL from the listing page. */
export async function discoverPlanoUrl(browser: { newContext: () => Promise<BrowserContext> }): Promise<string> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/planos?uf=SP", gotoOpts);
    const link = page.locator('a[href^="/planos/"]').first();
    await link.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    return (await link.getAttribute("href")) || "";
  } catch {
    return "";
  } finally {
    await ctx.close();
  }
}

/** Discover a real operadora detail URL from the listing page. */
export async function discoverOperadoraUrl(browser: { newContext: () => Promise<BrowserContext> }): Promise<string> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/operadoras?uf=SP", gotoOpts);
    const link = page.locator('a[href^="/operadoras/"]').first();
    await link.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    return (await link.getAttribute("href")) || "";
  } catch {
    return "";
  } finally {
    await ctx.close();
  }
}

/** Discover two real plan IDs for comparison tests. */
export async function discoverCompareIds(browser: { newContext: () => Promise<BrowserContext> }): Promise<number[]> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/planos?uf=SP", gotoOpts);
    const links = page.locator('a[href^="/planos/"]');
    await links.first().waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    const hrefs = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")).filter(Boolean).slice(0, 3),
    );
    return hrefs
      .map((h) => parseInt(h!.split("/planos/")[1]!, 10))
      .filter((n) => !isNaN(n));
  } catch {
    return [];
  } finally {
    await ctx.close();
  }
}

/** Discover a real blog post slug. */
export async function discoverBlogSlug(browser: { newContext: () => Promise<BrowserContext> }): Promise<string> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto("/blog", gotoOpts);
    const link = page.locator('a[href^="/blog/"]').first();
    await link.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT });
    return (await link.getAttribute("href")) || "";
  } catch {
    return "";
  } finally {
    await ctx.close();
  }
}
