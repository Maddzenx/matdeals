
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";
import { toast } from "@/components/ui/use-toast";

export const useProductFetching = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIcaProducts = useCallback(async () => {
    console.log("Fetching products from Supabase ICA table...");
    
    const { data: icaData, error: icaError } = await supabase
      .from('ICA')
      .select('*');
    
    if (icaError) {
      console.error("Supabase ICA query error:", icaError);
      throw icaError;
    }
    
    console.log("Raw ICA data:", icaData?.length || 0, "items");
    return icaData || [];
  }, []);

  const fetchWillysProducts = useCallback(async () => {
    const { data: willysData, error: willysError } = await supabase
      .from('Willys')
      .select('*');
      
    if (willysError) {
      console.error("Supabase Willys query error:", willysError);
      // Don't throw, we'll still use ICA data if available
    }
    
    console.log("Raw Willys data:", willysData?.length || 0, "items");
    return willysData || [];
  }, []);

  return {
    fetchIcaProducts,
    fetchWillysProducts,
    loading,
    setLoading,
    error,
    setError
  };
};
