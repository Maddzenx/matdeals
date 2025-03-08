
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch products from Supabase ICA table
        const { data, error } = await supabase
          .from('ICA')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform Supabase data to match our Product interface
          const transformedProducts: Product[] = data.map((item) => ({
            id: item.id || `ica-${Math.random().toString(36).substring(2, 9)}`,
            image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
            name: item.name || 'Product',
            details: item.description || 'No description available',
            currentPrice: `${item.price || 0}:00 kr`,
            originalPrice: '',
            store: 'ICA',
            category: 'other'
          }));
          
          console.log('Fetched products from Supabase:', transformedProducts);
          setProducts(transformedProducts);
        }
      } catch (err) {
        console.error('Error fetching products from Supabase:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
