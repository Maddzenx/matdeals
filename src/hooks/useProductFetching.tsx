
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";

export const useProductFetching = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIcaProducts = useCallback(async (showNotifications = false) => {
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
      }
      
      return icaData || [];
    } catch (error) {
      console.error("Error in fetchIcaProducts:", error);
      throw error;
    }
  }, []);

  const fetchWillysProducts = useCallback(async (showNotifications = false) => {
    console.log("Fetching products from Supabase Willys table...");
    
    try {
      // Log the query we're about to make for debugging
      console.log("About to query Willys table with: supabase.from('Willys').select('*')");
      
      const { data: willysData, error: willysError } = await supabase
        .from('Willys')
        .select('*');
        
      if (willysError) {
        console.error("Supabase Willys query error:", willysError);
        console.error("Error details:", JSON.stringify(willysError));
        throw willysError;
      }
      
      console.log("Raw Willys data:", willysData?.length || 0, "items");
      if (willysData && willysData.length > 0) {
        console.log("Sample Willys item:", willysData[0]);
      } else {
        console.warn("No Willys data found in database");
      }
      
      return willysData || [];
    } catch (error) {
      console.error("Error in fetchWillysProducts:", error);
      console.error("Error details:", JSON.stringify(error));
      return [];
    }
  }, []);

  const refreshProducts = useCallback(async (showNotifications = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting refreshProducts function...");
      
      const [icaData, willysData] = await Promise.all([
        fetchIcaProducts(showNotifications).catch(err => {
          console.error("Error fetching ICA products during refresh:", err);
          return [];
        }),
        fetchWillysProducts(showNotifications).catch(err => {
          console.error("Error fetching Willys products during refresh:", err);
          return [];
        })
      ]);
      
      console.log(`Refreshed products - ICA: ${icaData.length}, Willys: ${willysData.length}`);
      
      return { icaData, willysData };
    } catch (error) {
      console.error("Error in refreshProducts:", error);
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
