
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useScrapeWillys = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeWillys = async (showNotification = true) => {
    try {
      setScraping(true);
      
      if (showNotification) {
        toast({
          title: "Hämtar Willys-produkter",
          description: "Vänta medan vi hämtar de senaste erbjudandena...",
        });
      }
      
      console.log("Starting Willys scraping process");
      
      // Set up a timeout for the request (120 seconds to allow more time)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Förfrågan tog för lång tid (120 sekunder)')), 120000);
      });
      
      // Create the invocation promise with forceRefresh flag
      const invocationPromise = supabase.functions.invoke('scrape-willys', {
        body: { forceRefresh: true }
      });
      
      // Race between timeout and invocation
      const { data, error } = await Promise.race([
        invocationPromise,
        timeoutPromise.then(() => { 
          throw new Error('Förfrågan tog för lång tid (120 sekunder)');
        })
      ]);
      
      if (error) {
        console.error("Funktionsfel:", error);
        throw error;
      }
      
      console.log("Skrapningsresultat från Willys:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Okänt fel i skrapningsfunktionen");
      }
      
      // Refresh the products after scraping - whether successful or fallback
      console.log("Scraping completed, now refreshing products");
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        console.error("Refresh error:", refreshResult.error);
        throw new Error("Kunde inte uppdatera produkter efter skrapning");
      }
      
      const productsCount = data.products?.length || 0;
      
      if (showNotification) {
        toast({
          title: "Lyckades!",
          description: `Uppdaterade ${productsCount} produkter från Willys.`,
        });
      }
      
      return data;
    } catch (err: any) {
      console.error("Fel vid skrapning av Willys:", err);
      
      // Check if we need to refresh products even after error
      // (in cases where the edge function returned fallback products)
      try {
        console.log("Attempting to refresh products despite error");
        await refetchProducts();
      } catch (refreshErr) {
        console.error("Could not refresh products after error:", refreshErr);
      }
      
      if (showNotification) {
        // More user-friendly error message
        let errorMessage = "Kunde inte hämta Willys-produkter. Försök igen senare.";
        
        if (err instanceof Error) {
          if (err.name === "AbortError" || 
              (err.message && (err.message.includes("timeout") || err.message.includes("tid")))) {
            errorMessage = "Förfrågan tog för lång tid och avbröts. Willys-webbplatsen kan vara långsam eller otillgänglig.";
          } else if (err.message && typeof err.message === 'string') {
            if (!err.message.includes("token") && 
                !err.message.includes("auth") && 
                !err.message.includes("key")) {
              errorMessage = `Fel: ${err.message}`;
            }
          }
        }
        
        toast({
          title: "Fel",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      // Re-throw for handling in the caller
      throw err;
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeWillys };
};
