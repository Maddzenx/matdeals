
import { useEffect, useState, useCallback } from "react";
import { Product } from "@/data/types";
import { transformIcaProducts, transformWillysProducts } from "@/utils/productTransformers";
import { useProductFetching } from "@/hooks/useProductFetching";
import { showNoIcaProductsWarning, showFetchErrorNotification } from "@/utils/productNotifications";
import { toast } from "@/components/ui/use-toast";

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
        
        if (icaData.length > 0) {
          console.log("Sample ICA data:", icaData[0]);
        }
      } catch (icaError) {
        console.error("Error fetching ICA products:", icaError);
        // Continue execution to try Willys products
      }
      
      // Fetch Willys products
      let willysData: any[] = [];
      try {
        willysData = await fetchWillysProducts();
        console.log("Successfully fetched Willys data:", willysData?.length);
        
        if (willysData.length > 0) {
          console.log("Sample Willys data:", willysData[0]);
        }
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
        console.log("First few ICA products:", icaProducts.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          store: p.store,
          category: p.category
        })));
      } else {
        console.warn("No ICA products after transformation!");
      }
      
      console.log('Willys products transformed:', willysProducts.length);
      if (willysProducts.length > 0) {
        console.log("First few Willys products:", willysProducts.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          store: p.store,
          category: p.category
        })));
      } else {
        console.warn("No Willys products after transformation!");
      }
      
      // Combine all products
      const allProducts = [...icaProducts, ...willysProducts];
      console.log('Total number of products:', allProducts.length);
      
      // Group products by store for debugging
      const storeCount = allProducts.reduce((acc, product) => {
        const store = product.store?.toLowerCase() || 'unknown';
        acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('Products by store:', storeCount);
      
      if (allProducts.length > 0) {
        toast({
          title: "Produkter laddade",
          description: `Totalt ${allProducts.length} produkter från ICA (${icaProducts.length}) och Willys (${willysProducts.length})`,
          variant: "default"
        });
      }
      
      // Always set products, even if empty, to avoid stale state
      setProducts(allProducts);
      
      // If we have no products, show a warning
      if (allProducts.length === 0) {
        toast({
          title: "Inga produkter hittades",
          description: "Klicka på uppdatera för att hämta nya erbjudanden.",
          variant: "destructive"
        });
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
