
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
    setIsRefreshing(true);
    
    if (showNotification) {
      toast.info("Uppdaterar produkter...", {
        duration: 2000,
      });
    }
    
    try {
      console.log("Starting refresh of product data");
      
      // First, try to just fetch the data from Supabase without scraping
      console.log("Attempting to fetch existing data from Supabase");
      const result = await refetch();
      console.log("Fetch result:", result);
      
      // Only scrape if explicitly requested or if there's no data
      if (showNotification) {
        console.log("Scraping new data from store websites");
        
        // Prioritize Willys scraping 
        await handleScrapeWillys(true).catch(err => {
          console.error("Error scraping Willys:", err);
        });
        
        await handleScrapeIca(true).catch(err => {
          console.error("Error scraping ICA:", err);
        });
  
        await handleScrapeHemkop(true).catch(err => {
          console.error("Error scraping Hemköp:", err);
        });
        
        // Refetch after scraping to get the latest data
        console.log("Refetching after scraping to get the latest data");
        const refreshResult = await refetch();
        console.log("Refetch after scraping result:", refreshResult);
        
        if (refreshResult.success) {
          if (showNotification) {
            toast.success("Produkterna har uppdaterats", {
              duration: 3000,
            });
          }
        } else {
          if (showNotification) {
            toast.error("Kunde inte uppdatera produkter", {
              description: "Försök igen senare",
            });
          }
        }
        
        return refreshResult;
      }
      
      return result;
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
    }
  };

  return {
    isRefreshing: isRefreshing || scrapingIca || scrapingWillys || scrapingHemkop,
    handleRefresh
  };
};
