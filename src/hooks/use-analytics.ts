/**
 * React hook that tracks page views on route changes.
 *
 * Call this once in the root App component. It listens to react-router
 * location changes and fires a GA4 page_view event for each navigation.
 */

import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackPageView } from "@/lib/analytics";

export function useAnalytics(): void {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
