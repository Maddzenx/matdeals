
import { useEffect, useState, useCallback } from "react";
import { Product } from "@/data/types";
import { transformIcaProducts, transformWillysProducts } from "@/utils/productTransformers";
import { useProductFetching } from "@/hooks/useProductFetching";
import { showNoIcaProductsWarning, showFetchErrorNotification } from "@/utils/productNotifications";

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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting to fetch products in useSupabaseProducts");
      
      // Fetch ICA products
      let icaData: any[] = [];
      try {
        icaData = await fetchIcaProducts();
        console.log("Successfully fetched ICA data:", icaData?.length);
      } catch (icaError) {
        console.error("Error fetching ICA products:", icaError);
        // Continue execution to try Willys products
      }
      
      // Fetch Willys products
      let willysData: any[] = [];
      try {
        willysData = await fetchWillysProducts();
        console.log("Successfully fetched Willys data:", willysData?.length);
      } catch (willysError) {
        console.error("Error fetching Willys products:", willysError);
        // Continue execution
      }
      
      console.log("Fetching completed, starting transformation");
      
      // Transform products using our utility functions
      const icaProducts = transformIcaProducts(icaData);
      const willysProducts = transformWillysProducts(willysData);
      
      // Log products to help debugging
      console.log('ICA products transformed:', icaProducts.length);
      if (icaProducts.length > 0) {
        console.log("First few ICA products:", icaProducts.slice(0, 3));
      } else {
        console.warn("No ICA products after transformation!");
      }
      
      console.log('Willys products transformed:', willysProducts.length);
      if (willysProducts.length > 0) {
        console.log("First few Willys products:", willysProducts.slice(0, 3));
      } else {
        console.warn("No Willys products after transformation!");
      }
      
      // Combine all products
      const allProducts = [...icaProducts, ...willysProducts];
      console.log('Total number of products:', allProducts.length);
      console.log('ICA products:', icaProducts.length);
      console.log('Willys products:', willysProducts.length);
      
      // Always set products, even if empty, to avoid stale state
      setProducts(allProducts);
      
      // If we have no ICA products, show a warning
      if (icaProducts.length === 0 && icaData.length > 0) {
        showNoIcaProductsWarning();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error("Error in fetchProducts:", err);
      showFetchErrorNotification(err);
    } finally {
      setLoading(false);
    }
  }, [fetchIcaProducts, fetchWillysProducts, setLoading, setError]);

  useEffect(() => {
    console.log("useSupabaseProducts useEffect running, calling fetchProducts");
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(async () => {
    console.log("Refetching products");
    try {
      setLoading(true);
      await fetchProducts();
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
