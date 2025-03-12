
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
          if (!item.name) {
            console.warn("Skipping item without name:", item);
            return null;
          }
          
          // Extract detailed information from the combined description field
          const descriptionParts = item.description ? item.description.split(' | ') : [];
          const baseDescription = descriptionParts[0] || 'Ingen beskrivning tillgänglig';
          
          // Parse the price string to get the numeric value
          let formattedPrice = 'N/A';
          if (item.price !== null && item.price !== undefined) {
            formattedPrice = `${item.price}:- kr`;
          }
          
          // Categorize products based on description keywords
          let category = 'Other';
          const lowerDesc = (item.description || '').toLowerCase();
          const lowerName = (item.name || '').toLowerCase();
          
          // Combined check of name and description for better categorization
          const combined = lowerName + ' ' + lowerDesc;
          
          if (combined.includes('grönsak') || combined.includes('frukt') || 
              combined.includes('äpple') || combined.includes('banan') ||
              combined.includes('mango')) {
            category = 'Fruits & Vegetables';
          } else if (combined.includes('kött') || combined.includes('fläsk') || 
                     combined.includes('nöt') || combined.includes('bacon')) {
            category = 'Meat';
          } else if (combined.includes('fisk') || combined.includes('lax') ||
                     combined.includes('torsk') || combined.includes('skaldjur')) {
            category = 'Fish';
          } else if (combined.includes('mjölk') || combined.includes('ost') || 
                     combined.includes('grädde') || combined.includes('yoghurt') ||
                     combined.includes('gräddfil')) {
            category = 'Dairy';
          } else if (combined.includes('snack') || combined.includes('chips') || 
                     combined.includes('godis') || combined.includes('choklad')) {
            category = 'Snacks';
          } else if (combined.includes('bröd') || combined.includes('bulle') ||
                     combined.includes('kaka')) {
            category = 'Bread';
          } else if (combined.includes('dryck') || combined.includes('läsk') ||
                     combined.includes('juice') || combined.includes('vatten')) {
            category = 'Drinks';
          }
          
          // Make sure the category exists in the app's category list
          // This ensures products will show up in the UI
          if (!['Fruits & Vegetables', 'Meat', 'Fish', 'Dairy', 'Snacks', 'Bread', 'Drinks', 'Other'].includes(category)) {
            category = 'Other';
          }
          
          const product = {
            id: `ica-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`,
            image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
            name: item.name,
            details: baseDescription,
            currentPrice: formattedPrice,
            originalPrice: '',
            store: 'ICA',
            category: category,
            offerBadge: 'Erbjudande' // Swedish offer badge
          };
          
          console.log(`Transformed product: ${product.name}, Category: ${product.category}`);
          return product;
        }).filter(Boolean) as Product[]; // Remove null items
        
        console.log('Fetched and transformed ICA products:', transformedProducts);
        console.log('Number of valid transformed products:', transformedProducts.length);
        setProducts(transformedProducts);
      } else {
        console.log('No ICA products found in Supabase.');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      toast({
        title: "Fel vid laddning av produkter",
        description: "Kunde inte ladda produkter från Supabase. Försök igen senare.",
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
      setLoading(true);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  return { products, loading, error, refetch };
};
