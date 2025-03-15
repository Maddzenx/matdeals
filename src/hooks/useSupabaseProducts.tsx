
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
    loading, 
    setLoading, 
    error, 
    setError 
  } = useProductFetching();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from both sources
      const icaData = await fetchIcaProducts();
      const willysData = await fetchWillysProducts();
      
      // Transform products using our utility functions
      const icaProducts = transformIcaProducts(icaData);
      const willysProducts = transformWillysProducts(willysData);
      
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
        showNoIcaProductsWarning();
        setProducts(allProducts); // Still set whatever products we have
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      showFetchErrorNotification(err);
    } finally {
      setLoading(false);
    }
  }, [fetchIcaProducts, fetchWillysProducts, setLoading, setError]);

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
  }, [fetchProducts, setLoading]);

  return { products, loading, error, refetch };
};
