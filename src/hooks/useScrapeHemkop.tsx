
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useScrapeHemkop = (
  refetch?: () => Promise<{ success: boolean; error?: any }>
) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeHemkop = async (showNotifications = true) => {
    try {
      if (showNotifications) {
        toast.info("Uppdaterar Hemköp erbjudanden...", {
          duration: 2000,
        });
      }
      
      setScraping(true);
      
      // Call the Hemköp scraper edge function
      const { data, error } = await supabase.functions.invoke("scrape-hemkop", {
        body: { forceRefresh: true }
      });
      
      if (error) {
        console.error("Error calling Hemköp scraper:", error);
        if (showNotifications) {
          toast.error("Kunde inte uppdatera Hemköp erbjudanden", {
            description: error.message || "Ett oväntat fel inträffade",
          });
        }
        return;
      }
      
      console.log("Hemköp scraper response:", data);
      
      if (data.success) {
        if (showNotifications) {
          toast.success("Hemköp erbjudanden uppdaterade", {
            description: data.message || `Hittade ${data.products?.length || 0} produkter`,
          });
        }
        
        // Refresh the products data if refetch function is provided
        if (refetch) {
          await refetch();
        }
      } else {
        console.error("Hemköp scraper failed:", data);
        if (showNotifications) {
          toast.error("Kunde inte uppdatera Hemköp erbjudanden", {
            description: data.error || "Ett oväntat fel inträffade",
          });
        }
      }
    } catch (error) {
      console.error("Error in handleScrapeHemkop:", error);
      if (showNotifications) {
        toast.error("Kunde inte uppdatera Hemköp erbjudanden", {
          description: "Ett oväntat fel inträffade",
        });
      }
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeHemkop };
};
