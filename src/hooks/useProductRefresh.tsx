
import { useState } from "react";
import { useScrapeIca } from "@/hooks/useScrapeIca";
import { useScrapeWillys } from "@/hooks/useScrapeWillys";
import { toast } from "@/components/ui/use-toast";

export const useProductRefresh = (refetch: () => Promise<{ success: boolean; error?: any }>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { scraping: scrapingIca, handleScrapeIca } = useScrapeIca(refetch);
  const { scraping: scrapingWillys, handleScrapeWillys } = useScrapeWillys(refetch);

  const handleRefresh = async (showNotification = false) => {
    setIsRefreshing(true);
    
    try {
      console.log("Starting refresh of both ICA and Willys data");
      
      await Promise.all([
        handleScrapeIca(false).catch(err => {
          console.error("Error scraping ICA:", err);
          if (showNotification) {
            toast({
              title: "Fel vid uppdatering av ICA",
              description: "Kunde inte uppdatera ICA-erbjudanden. Willys-erbjudanden uppdateras ändå.",
              variant: "destructive"
            });
          }
        }),
        handleScrapeWillys(false).catch(err => {
          console.error("Error scraping Willys:", err);
          if (showNotification) {
            toast({
              title: "Fel vid uppdatering av Willys",
              description: "Kunde inte uppdatera Willys-erbjudanden. ICA-erbjudanden uppdateras ändå.",
              variant: "destructive"
            });
          }
        })
      ]);
      
      await refetch();
      
      if (showNotification) {
        toast({
          title: "Erbjudanden uppdaterade",
          description: "Produktdata har uppdaterats från både ICA och Willys.",
        });
      }
    } catch (error) {
      console.error("Error during refresh:", error);
      if (showNotification) {
        toast({
          title: "Refresheringsfel",
          description: "Ett fel inträffade vid uppdatering av erbjudanden.",
          variant: "destructive"
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing: isRefreshing || scrapingIca || scrapingWillys,
    handleRefresh
  };
};
