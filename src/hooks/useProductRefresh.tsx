
import { useState, useEffect } from "react";
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

  // Auto-refresh data only on first app load
  useEffect(() => {
    // Only run the auto-refresh if this is the first load of the app
    if (isFirstLoad) {
      const autoRefresh = async () => {
        // Don't show notifications for background refresh
        await handleRefresh();
      };
      
      // Add a small delay to not impact initial rendering
      const timer = setTimeout(autoRefresh, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  const handleRefresh = async (showNotification = false) => {
    setIsRefreshing(true);
    
    if (showNotification) {
      toast.info("Uppdaterar produkter...", {
        duration: 2000,
      });
    }
    
    try {
      console.log("Starting refresh of ICA, Willys, and Hemköp data");
      
      // Schedule scraping operations one after another to avoid overwhelming the server
      await handleScrapeIca(false).catch(err => {
        console.error("Error scraping ICA:", err);
      });

      await handleScrapeWillys(false).catch(err => {
        console.error("Error scraping Willys:", err);
      });

      await handleScrapeHemkop(false).catch(err => {
        console.error("Error scraping Hemköp:", err);
      });
      
      const result = await refetch();
      
      if (result.success) {
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
