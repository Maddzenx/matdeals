
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
      
      console.log("Calling scrape-hemkop edge function with forceRefresh=true");
      
      // Call the Hemköp scraper edge function with explicit forceRefresh
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
        return { success: false, error };
      }
      
      console.log("Hemköp scraper response:", data);
      
      if (data?.success) {
        if (showNotifications) {
          toast.success("Hemköp erbjudanden uppdaterade", {
            description: `Hittade ${data.products?.length || 0} produkter`,
          });
        }
        
        // Refresh the products data if refetch function is provided
        if (refetch) {
          await refetch();
        }
        
        return { success: true };
      } else {
        console.error("Hemköp scraper failed:", data);
        if (showNotifications) {
          toast.error("Kunde inte uppdatera Hemköp erbjudanden", {
            description: data?.error || "Ett oväntat fel inträffade",
          });
        }
        return { success: false, error: data?.error };
      }
    } catch (error) {
      console.error("Error in handleScrapeHemkop:", error);
      if (showNotifications) {
        toast.error("Kunde inte uppdatera Hemköp erbjudanden", {
          description: "Ett oväntat fel inträffade",
        });
      }
      return { success: false, error };
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeHemkop };
};
