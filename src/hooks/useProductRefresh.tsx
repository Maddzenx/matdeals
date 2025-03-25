
import { useState, useEffect, useRef } from "react";
import { useScrapeIca } from "@/hooks/useScrapeIca";
import { useScrapeWillys } from "@/hooks/useScrapeWillys";
import { useScrapeHemkop } from "@/hooks/useScrapeHemkop";
import { useAppSession } from "@/hooks/useAppSession";
import { toast } from "sonner";

export const useProductRefresh = (refetch: () => Promise<{ success: boolean; error?: any }>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);
  const { scraping: scrapingHemkop, handleScrapeHemkop } = useScrapeHemkop(refetch);
  const { isFirstLoad } = useAppSession();
  const isRefreshAttempted = useRef(false);
  const isScrapingInProgress = useRef(false);

  // Auto-refresh data only on first app load
  useEffect(() => {
    // Only run the auto-refresh if this is the first load of the app
    if (isFirstLoad && !isRefreshAttempted.current) {
      isRefreshAttempted.current = true;
      const autoRefresh = async () => {
        // Don't show notifications for background refresh
        await handleRefresh(false);
      };
      
      // Add a small delay to not impact initial rendering
      const timer = setTimeout(autoRefresh, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  const handleRefresh = async (showNotification = true) => {
    if (isScrapingInProgress.current) {
      console.log("Refresh already in progress, skipping request");
      if (showNotification) {
        toast.info("Uppdatering pågår redan...", {
          duration: 2000,
        });
      }
      return { success: false, error: "Refresh already in progress" };
    }

    isScrapingInProgress.current = true;
    setIsRefreshing(true);
    
    if (showNotification) {
      toast.info("Uppdaterar produkter...", {
        description: "Hämtar erbjudanden från butiker, detta kan ta några minuter",
        duration: 10000,
      });
    }
    
    try {
      console.log("Starting refresh of product data from scrapers...");
      
      // First, try to just fetch the data from Supabase without scraping
      console.log("Attempting to fetch existing data from Supabase");
      
      // Always scrape data from all stores to make sure we have fresh data
      console.log("Scraping new data from all store websites");
      
      // Run all scraping requests in parallel with proper error handling
      const scrapePromises = [
        handleScrapeWillys(showNotification).catch(err => {
          console.error("Error scraping Willys:", err);
          return { success: false, error: err };
        }),
        
        handleScrapeIca(showNotification).catch(err => {
          console.error("Error scraping ICA:", err);
          return { success: false, error: err };
        }),
        
        handleScrapeHemkop(showNotification).catch(err => {
          console.error("Error scraping Hemköp:", err);
          return { success: false, error: err };
        })
      ];
      
      // Wait for all scraping operations to complete
      const scrapeResults = await Promise.all(scrapePromises);
      
      // Log results for debugging
      console.log("Scrape results:", scrapeResults);
      
      // Check if any of the scraping operations were successful
      const anyScrapeSuccessful = scrapeResults.some(r => r && r.success);
      
      if (anyScrapeSuccessful) {
        console.log("At least one scraper was successful, refetching data");
      } else {
        console.warn("No scrapers were successful, but continuing with refetch anyway");
      }
      
      // Refetch after scraping to get the latest data
      console.log("Refetching after scraping to get the latest data");
      const refreshResult = await refetch();
      console.log("Refetch after scraping result:", refreshResult);
      
      if (refreshResult.success) {
        if (showNotification) {
          toast.success("Produkterna har uppdaterats", {
            description: "Erbjudanden har hämtats från alla butiker",
            duration: 5000,
          });
        }
      } else {
        if (showNotification) {
          toast.error("Kunde inte uppdatera alla produkter", {
            description: "Vissa butiker kunde inte nås. Försök igen om en stund.",
          });
        }
        console.error("Failed to refresh products:", refreshResult.error);
      }
      
      return refreshResult;
    } catch (error) {
      console.error("Error during refresh:", error);
      if (showNotification) {
        toast.error("Ett fel uppstod vid uppdatering", {
          description: "Kontrollera din internetanslutning och försök igen",
        });
      }
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
