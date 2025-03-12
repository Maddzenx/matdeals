
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
      
      // Set up a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Förfrågan tog för lång tid (90 sekunder)')), 90000);
      });
      
      // Create the invocation promise
      const invocationPromise = supabase.functions.invoke('scrape-ica');
      
      // Race between timeout and invocation
      const { data, error } = await Promise.race([
        invocationPromise,
        timeoutPromise.then(() => { 
          throw new Error('Förfrågan tog för lång tid (90 sekunder)');
        })
      ]);
      
      if (error) {
        console.error("Funktionsfel:", error);
        throw error;
      }
      
      console.log("Skrapningsresultat:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Okänt fel i skrapningsfunktionen");
      }
      
      if (!data.products || data.products.length === 0) {
        toast({
          title: "Inga produkter hittades",
          description: "Skrapningen kunde inte hitta några giltiga produkter. Försök igen senare.",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh the products after scraping
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        throw new Error("Kunde inte uppdatera produkter efter skrapning");
      }
      
      toast({
        title: "Lyckades!",
        description: `Uppdaterade ${data.products?.length || 0} produkter från ICA.`,
      });
    } catch (err) {
      console.error("Fel vid skrapning av ICA:", err);
      
      // More user-friendly error message
      let errorMessage = "Kunde inte hämta ICA-produkter. Försök igen senare.";
      
      if (err.name === "AbortError" || 
          (err.message && err.message.includes("timeout") || err.message.includes("tid"))) {
        errorMessage = "Förfrågan tog för lång tid och avbröts. ICA-webbplatsen kan vara långsam eller otillgänglig.";
      } else if (err.message && typeof err.message === 'string') {
        // Only show the error message if it's appropriate for users
        if (!err.message.includes("token") && 
            !err.message.includes("auth") && 
            !err.message.includes("key")) {
          errorMessage = `Fel: ${err.message}`;
        }
      }
      
      toast({
        title: "Fel",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeIca };
};
