
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useScrapeIca = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeIca = async () => {
    try {
      setScraping(true);
      
      toast({
        title: "Hämtar ICA-produkter",
        description: "Vänta medan vi hämtar de senaste erbjudandena...",
      });
      
      console.log("Starting ICA scraping process");
      
      // Set up a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Förfrågan tog för lång tid (120 sekunder)')), 120000);
      });
      
      // Create the invocation promise
      const invocationPromise = supabase.functions.invoke('scrape-ica', {
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
      
      console.log("Skrapningsresultat från ICA:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Okänt fel i skrapningsfunktionen");
      }
      
      // Refresh the products after scraping
      console.log("ICA scraping completed, now refreshing products");
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        console.error("Refresh error:", refreshResult.error);
        throw new Error("Kunde inte uppdatera produkter efter skrapning");
      }
      
      const productsCount = data.products?.length || 0;
      
      toast({
        title: "Lyckades!",
        description: `Uppdaterade ${productsCount} produkter från ICA.`,
      });
      
      return data;
    } catch (err: any) {
      console.error("Fel vid skrapning av ICA:", err);
      
      // Try to refresh products even after error
      try {
        console.log("Attempting to refresh products despite error");
        await refetchProducts();
      } catch (refreshErr) {
        console.error("Could not refresh products after error:", refreshErr);
      }
      
      let errorMessage = "Kunde inte hämta ICA-produkter. Försök igen senare.";
      
      if (err instanceof Error) {
        if (err.message && typeof err.message === 'string') {
          errorMessage = `Fel: ${err.message}`;
        }
      }
      
      toast({
        title: "Fel",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeIca };
};
