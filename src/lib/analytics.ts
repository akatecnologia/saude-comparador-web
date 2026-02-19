/**
 * Google Analytics 4 helper functions.
 *
 * These wrap the global `gtag` function injected by the GA4 script tag
 * in index.html.  All calls are guarded so they do nothing when GA is
 * not loaded (e.g. ad-blockers, local development without the script).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Track a custom event with optional parameters.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

/**
 * Track a virtual page view (useful for SPA route changes).
 */
export function trackPageView(path: string): void {
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
    });
  }
}
