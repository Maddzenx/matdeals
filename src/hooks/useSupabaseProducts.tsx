
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/data/types";
import { useProductFetching } from "@/hooks/useProductFetching";
import { transformWillysJohannebergProducts } from "@/utils/transformers";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { refreshProducts, loading: fetchLoading } = useProductFetching();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["supabaseProducts"],
    queryFn: async () => {
      try {
        console.log("Executing query function for supabaseProducts");
        const result = await refreshProducts(false);
        
        // Log table structure for debugging
        console.log("Product refresh result:", result);
        
        if (!result.willysJohannebergData?.length) {
          console.warn("No Willys Johanneberg data found in database");
        }
        
        return result;
      } catch (error) {
        console.error("Error in fetch query function:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false, 
    refetchOnMount: "always", 
    refetchOnReconnect: true, 
  });

  useEffect(() => {
    if (data) {
      try {
        console.log("Processing data:", data);
        
        // Create fallback products if no data available
        if (!data.willysJohannebergData || data.willysJohannebergData.length === 0) {
          console.log("Creating fallback products since no data is available");
          const fallbackProducts: Product[] = [
            {
              id: "fallback-1",
              name: "Äpple Royal Gala",
              category: "fruits",
              store: "willys",
              currentPrice: "24:- kr",
              details: "Willys, Italien, Klass 1",
              image: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
              originalPrice: "29:- kr",
              offerBadge: "Erbjudande"
            },
            {
              id: "fallback-2",
              name: "Färsk Kycklingfilé",
              category: "meat",
              store: "willys",
              currentPrice: "89:- kr",
              details: "Kronfågel, Sverige, 700-925g",
              image: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
              originalPrice: "109:- kr",
              offerBadge: "Erbjudande"
            }
          ];
          setProducts(fallbackProducts);
          return;
        }
        
        // Transform data if available
        const transformedProducts = transformWillysJohannebergProducts(data.willysJohannebergData);
        console.log(`Transformed ${transformedProducts.length} Willys Johanneberg products`);
        
        if (transformedProducts.length > 0) {
          console.log("Sample transformed product:", transformedProducts[0]);
        }
        
        setProducts(transformedProducts);
      } catch (transformError) {
        console.error("Error transforming products:", transformError);
        // Create fallback products on error
        const fallbackProducts: Product[] = [
          {
            id: "error-1",
            name: "Nötfärs 12%",
            category: "meat",
            store: "willys",
            currentPrice: "69:- kr",
            details: "Svenskt Butikskött, 800g",
            image: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
            originalPrice: "89:- kr",
            offerBadge: "Veckans erbjudande"
          }
        ];
        setProducts(fallbackProducts);
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
