
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";
import { toast } from "@/components/ui/use-toast";

export const useProductFetching = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIcaProducts = useCallback(async () => {
    console.log("Fetching products from Supabase ICA table...");
    
    try {
      const { data: icaData, error: icaError } = await supabase
        .from('ICA')
        .select('*');
      
      if (icaError) {
        console.error("Supabase ICA query error:", icaError);
        throw icaError;
      }
      
      console.log("Raw ICA data:", icaData?.length || 0, "items");
      if (icaData && icaData.length > 0) {
        console.log("Sample ICA item:", icaData[0]);
      } else {
        console.warn("No ICA data found in database");
        
        // If no data in the database, provide a clear message to the user
        toast({
          title: "Inga ICA-erbjudanden",
          description: "Det finns inga ICA-erbjudanden i databasen. Klicka på uppdatera för att hämta nya erbjudanden.",
          variant: "default"
        });
      }
      
      return icaData || [];
    } catch (error) {
      console.error("Error in fetchIcaProducts:", error);
      
      // Show a toast message about the error
      toast({
        title: "Fel vid hämtning av ICA-erbjudanden",
        description: error instanceof Error ? error.message : "Ett okänt fel inträffade",
        variant: "destructive"
      });
      
      throw error;
    }
  }, []);

  const fetchWillysProducts = useCallback(async () => {
    try {
      const { data: willysData, error: willysError } = await supabase
        .from('Willys')
        .select('*');
        
      if (willysError) {
        console.error("Supabase Willys query error:", willysError);
        // Don't throw, we'll still use ICA data if available
      }
      
      console.log("Raw Willys data:", willysData?.length || 0, "items");
      return willysData || [];
    } catch (error) {
      console.error("Error in fetchWillysProducts:", error);
      return [];
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [icaData, willysData] = await Promise.all([
        fetchIcaProducts(),
        fetchWillysProducts()
      ]);
      
      console.log(`Refreshed products - ICA: ${icaData.length}, Willys: ${willysData.length}`);
      
      return { icaData, willysData };
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchIcaProducts, fetchWillysProducts]);

  return {
    fetchIcaProducts,
    fetchWillysProducts,
    refreshProducts,
    loading,
    setLoading,
    error,
    setError
  };
};
