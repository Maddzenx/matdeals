
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useScrapeHemkop = (
  refetch?: () => Promise<{ success: boolean; error?: any }>
) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeHemkop = async (showNotifications = false) => { // Default to false
    try {
      setScraping(true);
      
      console.log("Calling scrape-hemkop edge function with forceRefresh=true");
      
      const { data, error } = await supabase.functions.invoke("scrape-hemkop", {
        body: { forceRefresh: true }
      });
      
      if (error) {
        console.error("Error calling Hemköp scraper:", error);
        return { success: false, error };
      }
      
      console.log("Hemköp scraper response:", data);
      
      // Refresh the products data if refetch function is provided
      if (refetch) {
        await refetch();
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in handleScrapeHemkop:", error);
      return { success: false, error };
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeHemkop };
};
