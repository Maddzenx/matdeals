
import { useCallback } from "react";

export const useProductNotifications = () => {
  const showNoProductsWarning = useCallback(() => {
    console.warn("No products found. Click refresh to fetch new offers.");
  }, []);

  const showFetchErrorNotification = useCallback((err: unknown) => {
    console.error("Error fetching products:", err instanceof Error ? err.message : 'Unknown error occurred');
  }, []);

  return {
    showNoProductsWarning,
    showFetchErrorNotification
  };
};
