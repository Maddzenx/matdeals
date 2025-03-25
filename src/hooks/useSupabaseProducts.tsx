
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/data/types";
import { useProductFetching } from "@/hooks/useProductFetching";
import { transformIcaProducts, transformWillysProducts, transformHemkopProducts, transformWillysJohannebergProducts } from "@/utils/transformers";
import { toast } from "sonner";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { refreshProducts, loading: fetchLoading } = useProductFetching();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["supabaseProducts"],
    queryFn: async () => {
      try {
        console.log("Executing query function for supabaseProducts");
        const result = await refreshProducts(false);
        console.log("Product refresh result:", result);
        return result;
      } catch (error) {
        console.error("Error in fetch query function:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus as it can cause confusion
    refetchOnMount: "always", // Always refetch when the component mounts
    refetchOnReconnect: true, // Refetch on reconnect
  });

  useEffect(() => {
    if (data) {
      try {
        console.log("Transforming data from query cache");
        
        // Transform ICA products
        const icaProducts = transformIcaProducts(data.icaData || []);
        console.log(`Transformed ICA products: ${icaProducts.length}`);
        
        // Transform Willys products
        const willysProducts = transformWillysProducts(data.willysData || []);
        console.log(`Transformed Willys products: ${willysProducts.length}`);
        
        // Transform Hemköp products
        const hemkopProducts = transformHemkopProducts(data.hemkopData || []);
        console.log(`Transformed Hemköp products: ${hemkopProducts.length}`);
        
        // Transform Willys Johanneberg products
        const willysJohannebergProducts = transformWillysJohannebergProducts(data.willysJohannebergData || []);
        console.log(`Transformed Willys Johanneberg products: ${willysJohannebergProducts.length}`);
        
        console.log(`Total transformed products: ICA (${icaProducts.length}), Willys (${willysProducts.length}), Hemköp (${hemkopProducts.length}), Willys Johanneberg (${willysJohannebergProducts.length})`);
        
        // Combine all products
        const allProducts = [...icaProducts, ...willysProducts, ...hemkopProducts, ...willysJohannebergProducts];
        console.log(`Total products after combining: ${allProducts.length}`);
        
        setProducts(allProducts);
      } catch (transformError) {
        console.error("Error transforming products:", transformError);
        toast.error("Kunde inte transformera produktdata", {
          description: "Ett fel uppstod vid behandling av produktdata"
        });
      }
    } else {
      console.log("No data available for transformation");
    }
  }, [data]);

  // Force an immediate update when the component with this hook mounts
  useEffect(() => {
    const initialLoad = async () => {
      try {
        console.log("Performing initial load in useSupabaseProducts");
        await refetch();
      } catch (error) {
        console.error("Error during initial load:", error);
      }
    };
    
    initialLoad();
  }, [refetch]);

  return {
    products,
    loading: isLoading || fetchLoading,
    error,
    refetch: async () => {
      try {
        console.log("Manually triggering product data refetch...");
        const result = await refetch();
        console.log("Refetch result:", result);
        return { success: !result.error, error: result.error };
      } catch (refetchError) {
        console.error("Error in refetch:", refetchError);
        return { success: false, error: refetchError };
      }
    }
  };
};
