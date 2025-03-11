
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";
import { toast } from "@/components/ui/use-toast";

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
      const { data, error } = await supabase
        .from('ICA')
        .select('*');
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      console.log("Raw Supabase data:", data);
      console.log("Number of items returned:", data?.length || 0);
      
      if (data && data.length > 0) {
        // Transform Supabase data to match our Product interface
        const transformedProducts: Product[] = data.map((item) => {
          // Extract detailed information from the combined description field
          const descriptionParts = item.description ? item.description.split(' | ') : [];
          const baseDescription = descriptionParts[0] || 'No description available';
          
          // Parse the price string to get the numeric value
          const priceString = item.price?.toString() || '0';
          const formattedPrice = `${priceString}:- kr`;
          
          // Categorize products based on description keywords
          let category = 'other';
          const lowerDesc = (item.description || '').toLowerCase();
          
          if (lowerDesc.includes('grönsak') || lowerDesc.includes('frukt')) {
            category = 'Fruits & Vegetables';
          } else if (lowerDesc.includes('kött') || lowerDesc.includes('fläsk') || lowerDesc.includes('nöt')) {
            category = 'Meat';
          } else if (lowerDesc.includes('fisk') || lowerDesc.includes('lax')) {
            category = 'Fish';
          } else if (lowerDesc.includes('mjölk') || lowerDesc.includes('ost')) {
            category = 'Dairy';
          } else if (lowerDesc.includes('snack') || lowerDesc.includes('chips') || lowerDesc.includes('godis')) {
            category = 'Snacks';
          } else if (lowerDesc.includes('bröd')) {
            category = 'Bread';
          } else if (lowerDesc.includes('dryck') || lowerDesc.includes('läsk')) {
            category = 'Drinks';
          }
          
          // Make sure the category exists in the app's category list
          // This ensures products will show up in the UI
          if (!['Fruits & Vegetables', 'Meat', 'Fish', 'Dairy', 'Snacks', 'Bread', 'Drinks', 'Other'].includes(category)) {
            category = 'Other';
          }
          
          const product = {
            id: `ica-${item.name?.replace(/\s+/g, '-').toLowerCase() || 'product'}-${Math.random().toString(36).substring(2, 9)}`,
            image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg',
            name: item.name || 'Product',
            details: baseDescription,
            currentPrice: formattedPrice,
            originalPrice: '',
            store: 'ICA',
            category: category
          };
          
          console.log(`Transformed product: ${product.name}, Category: ${product.category}`);
          return product;
        });
        
        console.log('Fetched and transformed ICA products:', transformedProducts);
        setProducts(transformedProducts);
      } else {
        console.log('No ICA products found in Supabase.');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Error loading products",
        description: "Could not load products from Supabase. Please try again later.",
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
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [fetchProducts]);

  return { products, loading, error, refetch };
};
