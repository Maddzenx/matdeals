
import { useEffect, useState, useCallback } from "react";
import { Product } from "@/data/types";
import { useProductFetching } from "@/hooks/useProductFetching";
import { useProductTransformation } from "@/hooks/useProductTransformation";
import { useProductNotifications } from "@/hooks/useProductNotifications";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { 
    fetchIcaProducts, 
    fetchWillysProducts, 
    refreshProducts,
    loading, 
    setLoading, 
    error, 
    setError 
  } = useProductFetching();
  
  const { transformProducts } = useProductTransformation();
  const { showNoProductsWarning, showFetchErrorNotification } = useProductNotifications();

  const fetchProducts = useCallback(async (showNotifications = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting to fetch products in useSupabaseProducts");
      
      // Fetch ICA products
      let icaData: any[] = [];
      try {
        icaData = await fetchIcaProducts(false);
        console.log("Successfully fetched ICA data:", icaData?.length);
      } catch (icaError) {
        console.error("Error fetching ICA products:", icaError);
        // Continue execution to try Willys products
      }
      
      // Fetch Willys products
      let willysData: any[] = [];
      try {
        willysData = await fetchWillysProducts(false);
        console.log("Successfully fetched Willys data:", willysData?.length);
      } catch (willysError) {
        console.error("Error fetching Willys products:", willysError);
        // Continue execution
      }
      
      // Transform all products and set state
      const allProducts = transformProducts(icaData, willysData);
      
      // Always set products, even if empty, to avoid stale state
      setProducts(allProducts);
      
      // If we have no products, show a warning only if explicitly requested
      if (allProducts.length === 0 && showNotifications) {
        showNoProductsWarning();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error("Error in fetchProducts:", err);
      if (showNotifications) {
        showFetchErrorNotification(err);
      }
    } finally {
      setLoading(false);
    }
  }, [
    fetchIcaProducts, 
    fetchWillysProducts, 
    transformProducts, 
    showNoProductsWarning, 
    showFetchErrorNotification, 
    setLoading, 
    setError
  ]);

  useEffect(() => {
    console.log("useSupabaseProducts useEffect running, calling fetchProducts");
    fetchProducts(false);
  }, [fetchProducts]);

  const refetch = useCallback(async (showNotifications = false) => {
    console.log("Refetching products");
    try {
      setLoading(true);
      await fetchProducts(showNotifications);
      return { success: true };
    } catch (err) {
      console.error("Error refetching products:", err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, setLoading]);

  return { products, loading, error, refetch };
};
