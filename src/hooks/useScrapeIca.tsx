import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useScrapeIca = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeIca = async (showNotification = true) => {
    try {
      setScraping(true);
      
      if (showNotification) {
        toast({
          title: "Hämtar ICA-produkter",
          description: "Vänta medan vi hämtar de senaste erbjudandena...",
        });
      }
      
      console.log("Starting ICA scraping process");
      
      const { data, error } = await invokeScraperWithTimeout('scrape-ica', { forceRefresh: true });
      
      if (error) {
        console.error("Funktionsfel:", error);
        throw error;
      }
      
      console.log("Skrapningsresultat från ICA:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Okänt fel i skrapningsfunktionen");
      }
      
      console.log("ICA scraping completed, now refreshing products");
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        console.error("Refresh error:", refreshResult.error);
        throw new Error("Kunde inte uppdatera produkter efter skrapning");
      }
      
      const productsCount = data.products?.length || 0;
      console.log(`Updated ${productsCount} products from ICA`);
      
      return data;
    } catch (err: any) {
      console.error("Fel vid skrapning av ICA:", err);
      
      try {
        console.log("Attempting to refresh products despite error");
        await refetchProducts();
      } catch (refreshErr) {
        console.error("Could not refresh products after error:", refreshErr);
      }
      
      if (showNotification) {
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
      }
      
      throw err;
    } finally {
      setScraping(false);
    }
  };

  const invokeScraperWithTimeout = async (functionName: string, body: any, timeoutMs: number = 120000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Förfrågan tog för lång tid (120 sekunder)')), timeoutMs);
    });
    
    const invocationPromise = supabase.functions.invoke(functionName, { body });
    
    return await Promise.race([
      invocationPromise,
      timeoutPromise.then(() => { 
        throw new Error('Förfrågan tog för lång tid (120 sekunder)');
      })
    ]);
  };

  return { scraping, handleScrapeIca };
};
