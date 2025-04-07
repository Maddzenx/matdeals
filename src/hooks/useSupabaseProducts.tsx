import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["supabaseProducts"],
    queryFn: async () => {
      try {
        console.log("Fetching products from the products table");
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw productsError;
        }
        
        console.log("Fetched products:", productsData?.length || 0);
        return productsData || [];
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
        console.log("Processing fetched products data:", data.length);
        
        // Create fallback products if no data available
        if (!data || data.length === 0) {
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
              offerBadge: "Erbjudande",
              price: 24
            }
          ];
          setProducts(fallbackProducts);
          return;
        }
        
        // Transform database products to match our Product type
        const transformedProducts: Product[] = data.map(item => {
          // Enhanced price parsing to handle complex formats
          const currentPrice = parseProductPrice(item.price);
          
          return {
            id: item.id || `product-${Math.random().toString(36).substring(2, 9)}`,
            name: item.product_name || 'Unnamed Product',
            category: item.category || determineCategoryFromText(item.product_name || ''),
            store: item.store || 'Unknown Store',
            currentPrice: currentPrice,
            details: item.description || '',
            originalPrice: item.original_price ? formatPrice(item.original_price) : '',
            offerBadge: item.label || 'Erbjudande',
            unitPrice: item.unit_price || '',
            offer_details: item.offer_details || '',
            image: item.image_url || "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
            price: typeof item.price === 'string' ? item.price : undefined,
            position: item.position || undefined
          };
        });
        
        console.log(`Transformed ${transformedProducts.length} products`);
        
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
            offerBadge: "Veckans erbjudande",
            price: "69:- kr",
            position: 1
          }
        ];
        setProducts(fallbackProducts);
      }
    }
  }, [data]);

  return {
    products,
    loading: isLoading,
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

// Enhanced price parsing function
function parseProductPrice(priceValue: string | number | null | undefined): string {
  if (priceValue === null || priceValue === undefined) return '';
  
  // If it's already a formatted price string, return as-is
  if (typeof priceValue === 'string') {
    // Check for special formats like "3 för 22"
    const specialFormatMatch = priceValue.match(/([\d]+)\s+(för|st)\s+([\d.,]+)/);
    if (specialFormatMatch) {
      return priceValue;
    }
    
    // Try to convert to Swedish price format
    const priceString = priceValue.toString().replace('.', ',');
    return priceString.includes(',') || priceString.includes(':') 
      ? `${priceString} kr` 
      : `${priceString}:- kr`;
  }
  
  // Numeric price conversion
  const priceString = priceValue.toString().replace('.', ',');
  return `${priceString}:- kr`;
}

// Helper function to format price
function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '';
  
  const priceString = price.toString().replace('.', ',');
  return priceString.includes(',') || priceString.includes(':') 
    ? `${priceString} kr` 
    : `${priceString}:- kr`;
}

// Helper function to determine category from product name
function determineCategoryFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('äpple') || lowerText.includes('frukt') || lowerText.includes('grönt') || 
      lowerText.includes('banan') || lowerText.includes('tomat') || lowerText.includes('gurka')) {
    return 'fruits';
  }
  
  if (lowerText.includes('bröd') || lowerText.includes('bageri') || 
      lowerText.includes('kaka') || lowerText.includes('bulle')) {
    return 'bread';
  }
  
  if (lowerText.includes('kött') || lowerText.includes('fläsk') || 
      lowerText.includes('nöt') || lowerText.includes('kyckl')) {
    return 'meat';
  }
  
  if (lowerText.includes('ost') || lowerText.includes('mjölk') || 
      lowerText.includes('fil') || lowerText.includes('yog')) {
    return 'dairy';
  }
  
  if (lowerText.includes('dryck') || lowerText.includes('juice') || 
      lowerText.includes('vatten') || lowerText.includes('läsk')) {
    return 'beverages';
  }
  
  return 'Övrigt';
}
