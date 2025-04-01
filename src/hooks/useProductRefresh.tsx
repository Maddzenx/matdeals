
import { useState, useEffect, useRef } from "react";
import { useScrapeIca } from "@/hooks/useScrapeIca";
import { useScrapeWillys } from "@/hooks/useScrapeWillys";
import { useScrapeHemkop } from "@/hooks/useScrapeHemkop";
import { useAppSession } from "@/hooks/useAppSession";

export const useProductRefresh = (refetch: () => Promise<{ success: boolean; error?: any }>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);
  const { scraping: scrapingHemkop, handleScrapeHemkop } = useScrapeHemkop(refetch);
  const { isFirstLoad } = useAppSession();
  const isRefreshAttempted = useRef(false);
  const isScrapingInProgress = useRef(false);

  // Remove auto-refresh on first load
  useEffect(() => {
    // Removed auto-refresh logic
  }, []);

  const handleRefresh = async (showNotification = false) => { // Default to false
    if (isScrapingInProgress.current) {
      console.log("Refresh already in progress, skipping request");
      return { success: false, error: "Refresh already in progress" };
    }

    isScrapingInProgress.current = true;
    setIsRefreshing(true);
    
    try {
      console.log("Starting refresh of product data from scrapers...");
      
      const scrapePromises = [
        handleScrapeWillys(false).catch(err => {
          console.error("Error scraping Willys:", err);
          return { success: false, error: err };
        }),
        
        handleScrapeIca(false).catch(err => {
          console.error("Error scraping ICA:", err);
          return { success: false, error: err };
        }),
        
        handleScrapeHemkop(false).catch(err => {
          console.error("Error scraping Hemköp:", err);
          return { success: false, error: err };
        })
      ];
      
      const scrapeResults = await Promise.all(scrapePromises);
      
      const refreshResult = await refetch();
      
      return refreshResult;
    } catch (error) {
      console.error("Error during refresh:", error);
      return { success: false, error };
    } finally {
      setIsRefreshing(false);
      isScrapingInProgress.current = false;
    }
  };

  return {
    isRefreshing: isRefreshing || scrapingIca || scrapingWillys || scrapingHemkop,
    handleRefresh
  };
};
