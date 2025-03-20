
import { useState, useEffect } from "react";
import { useScrapeIca } from "@/hooks/useScrapeIca";
import { useScrapeWillys } from "@/hooks/useScrapeWillys";

export const useProductRefresh = (refetch: () => Promise<{ success: boolean; error?: any }>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);

  // Auto-refresh data in the background when the hook is initialized
  useEffect(() => {
    const autoRefresh = async () => {
      // Don't show notifications for background refresh
      await handleRefresh(false);
    };
    
    // Add a small delay to not impact initial rendering
    const timer = setTimeout(autoRefresh, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async (showNotification = false) => {
    setIsRefreshing(true);
    
    try {
      console.log("Starting refresh of both ICA and Willys data");
      
      await Promise.all([
        handleScrapeIca(showNotification).catch(err => {
          console.error("Error scraping ICA:", err);
        }),
        handleScrapeWillys(showNotification).catch(err => {
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
