
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useScrapeWillys = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeWillys = async (showNotification = true) => {
    try {
      setScraping(true);
      
      if (showNotification) {
        toast.info("Startar datainsamling från Willys...", {
          description: "Detta kan ta upp till 2 minuter",
          duration: 10000
        });
      }
      
      console.log("Starting Willys scraping process");
      
      // Set up a timeout for the request (120 seconds to allow more time)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request took too long (120 seconds)')), 120000);
      });
      
      // Create the invocation promise with forceRefresh flag
      const invocationPromise = supabase.functions.invoke('scrape-willys', {
        body: { forceRefresh: true, source: "manual-refresh" }
      });
      
      // Race between timeout and invocation
      const { data, error } = await Promise.race([
        invocationPromise,
        timeoutPromise.then(() => { 
          throw new Error('Request took too long (120 seconds)');
        })
      ]);
      
      if (error) {
        console.error("Function error:", error);
        throw error;
      }
      
      console.log("Scraping results from Willys:", data);
      
      if (!data || !data.success) {
        console.error("Willys scraping failed:", data?.error || "No data returned");
        throw new Error(data?.error || "Unknown error in scraping function");
      }
      
      // Check if we got any actual products
      const productsCount = data.products?.length || 0;
      console.log(`Received ${productsCount} products from Willys scraper`);
      
      if (productsCount === 0) {
        console.warn("Willys scraper returned zero products");
        if (showNotification) {
          toast.warning("Inga erbjudanden hittades på Willys", {
            description: "Detta kan bero på att deras webbplats har ändrats"
          });
        }
      }
      
      // Refresh the products after scraping - whether successful or fallback
      console.log("Scraping completed, now refreshing products");
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        console.error("Refresh error:", refreshResult.error);
        throw new Error("Could not update products after scraping");
      }
      
      if (showNotification && productsCount > 0) {
        toast.success("Datainsamling från Willys klar", {
          description: `Uppdaterade ${productsCount} produkter.`
        });
      }
      
      return { success: true, productsCount };
    } catch (err: any) {
      console.error("Error scraping Willys:", err);
      
      if (showNotification) {
        toast.error("Kunde inte hämta data från Willys", {
          description: err.message || "Okänt fel"
        });
      }
      
      // Always try to refresh products even after error
      // (in cases where the edge function returned fallback products)
      try {
        console.log("Attempting to refresh products despite error");
        await refetchProducts();
      } catch (refreshErr) {
        console.error("Could not refresh products after error:", refreshErr);
      }
      
      // Re-throw for handling in the caller
      return { success: false, error: err };
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeWillys };
};
