import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";

export const useProductFetching = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWillysJohannebergProducts = useCallback(async (showNotifications = false) => {
    console.log("Fetching products from Supabase Willys Johanneberg table...");
    
    try {
      console.log("About to query Willys Johanneberg table with: supabase.from('Willys Johanneberg').select('*')");
      
      const { data: willysJohannebergData, error: willysJohannebergError } = await supabase
        .from('Willys Johanneberg')
        .select('*');
        
      if (willysJohannebergError) {
        console.error("Supabase Willys Johanneberg query error:", willysJohannebergError);
        console.error("Error details:", JSON.stringify(willysJohannebergError));
        throw willysJohannebergError;
      }
      
      console.log("Raw Willys Johanneberg data:", willysJohannebergData?.length || 0, "items");
      if (willysJohannebergData && willysJohannebergData.length > 0) {
        console.log("Sample Willys Johanneberg item:", willysJohannebergData[0]);
      } else {
        console.warn("No Willys Johanneberg data found in database");
      }
      
      return willysJohannebergData || [];
    } catch (error) {
      console.error("Error in fetchWillysJohannebergProducts:", error);
      console.error("Error details:", JSON.stringify(error));
      return [];
    }
  }, []);

  const fetchIcaProducts = useCallback(async () => {
    console.log("ICA table no longer exists, returning empty array");
    return [];
  }, []);

  const fetchWillysProducts = useCallback(async () => {
    console.log("Willys table no longer exists, returning empty array");
    return [];
  }, []);

  const fetchHemkopProducts = useCallback(async () => {
    console.log("Hemköp table no longer exists, returning empty array");
    return [];
  }, []);

  const refreshProducts = useCallback(async (showNotifications = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting refreshProducts function...");
      
      const willysJohannebergData = await fetchWillysJohannebergProducts(showNotifications);
      
      console.log(`Refreshed products - Willys Johanneberg: ${willysJohannebergData.length}`);
      
      return { 
        icaData: [], 
        willysData: [], 
        hemkopData: [], 
        willysJohannebergData 
      };
    } catch (error) {
      console.error("Error in refreshProducts:", error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchWillysJohannebergProducts]);

  return {
    fetchIcaProducts,
    fetchWillysProducts,
    fetchHemkopProducts,
    fetchWillysJohannebergProducts,
    refreshProducts,
    loading,
    setLoading,
    error,
    setError
  };
};
