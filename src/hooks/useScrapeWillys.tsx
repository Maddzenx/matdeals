import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useScrapeWillys = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleScrapeWillys = async (showNotification = true) => {
    setScraping(true);
    setError(null);

    try {
      if (showNotification) {
        toast.info("Startar datainsamling från Willys...", {
          description: "Detta kan ta upp till 2 minuter",
          duration: 10000
        });
      }
      
      console.log("Starting Willys scraping process");
      
      // Check if we have any data in the Willys Johanneberg table first
      const { data: existingData, error: checkError } = await supabase
        .from('Willys Johanneberg')
        .select('count(*)');
        
      if (checkError) {
        console.error("Error checking existing Willys Johanneberg data:", checkError);
      } else {
        console.log("Current Willys Johanneberg data count:", existingData);
      }
      
      // Set up a timeout for the request (120 seconds to allow more time)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request took too long (120 seconds)')), 120000);
      });
      
      // Create the invocation promise with forceRefresh flag
      const invocationPromise = supabase.functions.invoke('scrape-willys', {
        body: { 
          forceRefresh: true, 
          source: "manual-refresh",
          target: "willys-johanneberg" // Explicitly target Willys Johanneberg
        }
      });
      
      // Race between timeout and invocation
      const { data, error: scrapeError } = await Promise.race([
        invocationPromise,
        timeoutPromise.then(() => { 
          throw new Error('Request took too long (120 seconds)');
        })
      ]);
      
      if (scrapeError) {
        console.error("Function error:", scrapeError);
        throw scrapeError;
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
      
      // After refreshing, check if we got data
      const { data: afterData, error: afterError } = await supabase
        .from('Willys Johanneberg')
        .select('count(*)');
        
      if (afterError) {
        console.error("Error checking after-refresh data:", afterError);
      } else {
        console.log("After refresh Willys Johanneberg data count:", afterData);
      }
      
      // Log the scraping completion
      const { error: logError } = await supabase.rpc('log_scrape_completion', {
        p_store: 'Willys',
        p_success: true,
        p_products_scraped: productsCount
      });

      if (logError) {
        console.error('Failed to log scraping completion:', logError);
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
      
      // Log the failed scraping attempt
      await supabase.rpc('log_scrape_completion', {
        p_store: 'Willys',
        p_success: false,
        p_error_message: err.message
      });
      
      // Re-throw for handling in the caller
      return { success: false, error: err };
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeWillys, error };
};
