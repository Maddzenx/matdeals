
import { useState, useEffect } from "react";
import { useScrapeIca } from "@/hooks/useScrapeIca";
import { useScrapeWillys } from "@/hooks/useScrapeWillys";
import { useAppSession } from "@/hooks/useAppSession";

export const useProductRefresh = (refetch: () => Promise<{ success: boolean; error?: any }>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);
  const { isFirstLoad } = useAppSession();

  // Auto-refresh data only on first app load
  useEffect(() => {
    // Only run the auto-refresh if this is the first load of the app
    if (isFirstLoad) {
      const autoRefresh = async () => {
        // Don't show notifications for background refresh
        await handleRefresh(false);
      };
      
      // Add a small delay to not impact initial rendering
      const timer = setTimeout(autoRefresh, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  const handleRefresh = async (showNotification = false) => {
    setIsRefreshing(true);
    
    try {
      console.log("Starting refresh of both ICA and Willys data");
      
      await Promise.all([
        handleScrapeIca(false).catch(err => { // Always use false to disable notifications
          console.error("Error scraping ICA:", err);
        }),
        handleScrapeWillys(false).catch(err => { // Always use false to disable notifications
          console.error("Error scraping Willys:", err);
        })
      ]);
      
      await refetch();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing: isRefreshing || scrapingIca || scrapingWillys,
    handleRefresh
  };
};
