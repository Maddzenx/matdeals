
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useScrapeWillys = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeWillys = async () => {
    try {
      setScraping(true);
      
      toast({
        title: "Hämtar Willys-produkter",
        description: "Vänta medan vi hämtar de senaste erbjudandena...",
      });
      
      // Set up a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Förfrågan tog för lång tid (90 sekunder)')), 90000);
      });
      
      // Create the invocation promise
      const invocationPromise = supabase.functions.invoke('scrape-willys');
      
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
      
      console.log("Skrapningsresultat från Willys:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Okänt fel i skrapningsfunktionen");
      }
      
      // Even if products is empty, we might have fallback products
      // Refresh the products after scraping
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        throw new Error("Kunde inte uppdatera produkter efter skrapning");
      }
      
      toast({
        title: "Lyckades!",
        description: `Uppdaterade ${data.products?.length || 0} produkter från Willys.`,
      });
      
      return data;
    } catch (err) {
      console.error("Fel vid skrapning av Willys:", err);
      
      // More user-friendly error message
      let errorMessage = "Kunde inte hämta Willys-produkter. Försök igen senare.";
      
      if (err.name === "AbortError" || 
          (err.message && err.message.includes("timeout") || err.message.includes("tid"))) {
        errorMessage = "Förfrågan tog för lång tid och avbröts. Willys-webbplatsen kan vara långsam eller otillgänglig.";
      } else if (err.message && typeof err.message === 'string') {
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
      throw err; // Re-throw for handling in the caller
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeWillys };
};
