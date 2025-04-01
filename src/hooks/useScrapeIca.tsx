
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useScrapeIca = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeIca = async (showNotification = false) => { // Default to false
    try {
      setScraping(true);
      
      console.log("Starting ICA scraping process");
      
      const { data, error } = await invokeScraperWithTimeout('scrape-ica', { forceRefresh: true });
      
      if (error) {
        console.error("Function error:", error);
        throw error;
      }
      
      console.log("Scraping results from ICA:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Unknown error in scraping function");
      }
      
      console.log("ICA scraping completed, now refreshing products");
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        console.error("Refresh error:", refreshResult.error);
        throw new Error("Could not update products after scraping");
      }
      
      return data;
    } catch (err: any) {
      console.error("Error scraping ICA:", err);
      throw err;
    } finally {
      setScraping(false);
    }
  };

  const invokeScraperWithTimeout = async (functionName: string, body: any, timeoutMs: number = 120000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request took too long (120 seconds)')), timeoutMs);
    });
    
    const invocationPromise = supabase.functions.invoke(functionName, { body });
    
    return await Promise.race([
      invocationPromise,
      timeoutPromise.then(() => { 
        throw new Error('Request took too long (120 seconds)');
      })
    ]);
  };

  return { scraping, handleScrapeIca };
};
