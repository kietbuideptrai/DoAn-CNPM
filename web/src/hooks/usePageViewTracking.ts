import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackNavigation } from "../api/analyticsClient";

export function usePageViewTracking(): void {
  const location = useLocation();

  useEffect(() => {
    trackNavigation(location.key, location.pathname);
  }, [location.key, location.pathname]);
}
