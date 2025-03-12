
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useScrapeIca = (refetchProducts: () => Promise<{ success: boolean; error?: any }>) => {
  const [scraping, setScraping] = useState(false);

  const handleScrapeIca = async () => {
    try {
      setScraping(true);
      
      toast({
        title: "Fetching ICA products",
        description: "Please wait while we fetch the latest offers...",
      });
      
      // Set up a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 90 seconds')), 90000);
      });
      
      // Create the invocation promise
      const invocationPromise = supabase.functions.invoke('scrape-ica');
      
      // Race between timeout and invocation
      const { data, error } = await Promise.race([
        invocationPromise,
        timeoutPromise.then(() => { 
          throw new Error('Request timeout after 90 seconds');
        })
      ]);
      
      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }
      
      console.log("Scraping result:", data);
      
      if (!data.success) {
        throw new Error(data.error || "Unknown error in scraping function");
      }
      
      if (!data.products || data.products.length === 0) {
        toast({
          title: "No products found",
          description: "The scraper couldn't find any valid products. Please try again later.",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh the products after scraping
      const refreshResult = await refetchProducts();
      
      if (!refreshResult.success) {
        throw new Error("Failed to refresh products after scraping");
      }
      
      toast({
        title: "Success!",
        description: `Updated ${data.products?.length || 0} products from ICA.`,
      });
    } catch (err) {
      console.error("Error scraping ICA:", err);
      
      // More user-friendly error message
      let errorMessage = "Failed to fetch ICA products. Please try again later.";
      
      if (err.name === "AbortError" || 
          (err.message && err.message.includes("timeout"))) {
        errorMessage = "The request took too long and was cancelled. The ICA website might be slow or unavailable.";
      } else if (err.message && typeof err.message === 'string') {
        // Only show the error message if it's appropriate for users
        if (!err.message.includes("token") && 
            !err.message.includes("auth") && 
            !err.message.includes("key")) {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setScraping(false);
    }
  };

  return { scraping, handleScrapeIca };
};
