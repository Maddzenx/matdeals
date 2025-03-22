
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/data/types";
import { useProductFetching } from "@/hooks/useProductFetching";
import { transformIcaProducts, transformWillysProducts, transformHemkopProducts } from "@/utils/transformers";
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
        const icaProducts = transformIcaProducts(data.icaData || []);
        const willysProducts = transformWillysProducts(data.willysData || []);
        const hemkopProducts = transformHemkopProducts(data.hemkopData || []);
        
        console.log(`Transformed products: ICA (${icaProducts.length}), Willys (${willysProducts.length}), Hemköp (${hemkopProducts.length})`);
        
        // Combine all products
        const allProducts = [...icaProducts, ...willysProducts, ...hemkopProducts];
        setProducts(allProducts);
      } catch (transformError) {
        console.error("Error transforming products:", transformError);
        toast.error("Kunde inte transformera produktdata", {
          description: "Ett fel uppstod vid behandling av produktdata"
        });
      }
    }
  }, [data]);

  return {
    products,
    loading: isLoading || fetchLoading,
    error,
    refetch: async () => {
      try {
        console.log("Manually triggering product data refetch...");
        const result = await refetch();
        return { success: !result.error, error: result.error };
      } catch (refetchError) {
        console.error("Error in refetch:", refetchError);
        return { success: false, error: refetchError };
      }
    }
  };
};
