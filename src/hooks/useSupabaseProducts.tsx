
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";
import { toast } from "@/components/ui/use-toast";
import { transformIcaProducts, transformWillysProducts } from "@/utils/productTransformers";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching products from Supabase ICA table...");
      
      // Fetch products from Supabase ICA table
      const { data: icaData, error: icaError } = await supabase
        .from('ICA')
        .select('*');
      
      if (icaError) {
        console.error("Supabase ICA query error:", icaError);
        throw icaError;
      }
      
      console.log("Raw ICA data:", icaData?.length || 0, "items");
      
      // Fetch products from Supabase Willys table (as secondary source)
      const { data: willysData, error: willysError } = await supabase
        .from('Willys')
        .select('*');
        
      if (willysError) {
        console.error("Supabase Willys query error:", willysError);
        // Don't throw, we'll still use ICA data if available
      }
      
      console.log("Raw Willys data:", willysData?.length || 0, "items");
      
      // Transform products using our utility functions
      const icaProducts = transformIcaProducts(icaData || []);
      const willysProducts = transformWillysProducts(willysData || []);
      
      // Log ICA products to help debugging
      console.log('ICA products transformed:', icaProducts.length);
      if (icaProducts.length > 0) {
        console.log("First few ICA products:", icaProducts.slice(0, 3));
      }
      
      // Combine all products - put ICA first
      const allProducts = [...icaProducts, ...willysProducts];
      console.log('Total number of products:', allProducts.length);
      console.log('ICA products:', icaProducts.length);
      console.log('Willys products:', willysProducts.length);
      
      // If we have ICA products, display them
      if (icaProducts.length > 0) {
        setProducts(allProducts);
      } else {
        console.warn("No ICA products found in database. Check if scraping was successful.");
        toast({
          title: "Inga ICA-produkter",
          description: "Kunde inte hitta några ICA-produkter i databasen. Försök uppdatera genom att trycka på uppdateringsknappen.",
          variant: "destructive"
        });
        setProducts(allProducts); // Still set whatever products we have
      }
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Fel vid laddning av produkter",
        description: "Kunde inte ladda produkter från Supabase. Försök igen senare.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  return { products, loading, error, refetch };
};
