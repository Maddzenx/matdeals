
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
      
      console.log("Fetching products from Supabase ICA and Willys tables...");
      
      // Fetch products from Supabase ICA table
      const { data: icaData, error: icaError } = await supabase
        .from('ICA')
        .select('*');
      
      if (icaError) {
        console.error("Supabase ICA query error:", icaError);
        throw icaError;
      }
      
      // Fetch products from Supabase Willys table
      const { data: willysData, error: willysError } = await supabase
        .from('Willys')
        .select('*');
        
      if (willysError) {
        console.error("Supabase Willys query error:", willysError);
        // Don't throw, we'll still use ICA data if available
      }
      
      console.log("Raw ICA data:", icaData?.length || 0, "items");
      console.log("Raw Willys data:", willysData?.length || 0, "items");
      
      if (icaData?.length > 0) {
        console.log("Sample ICA item:", icaData[0]);
      }
      
      if (willysData?.length > 0) {
        console.log("Sample Willys item:", willysData[0]);
      }
      
      // Transform ICA data
      const icaProducts: Product[] = (icaData || []).map((item) => {
        if (!item.name) {
          console.warn("Skipping ICA item without name:", item);
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
        let category = 'other';
        const lowerDesc = (item.description || '').toLowerCase();
        const lowerName = (item.name || '').toLowerCase();
        
        // Combined check of name and description for better categorization
        const combined = lowerName + ' ' + lowerDesc;
        
        if (combined.includes('grönsak') || combined.includes('frukt') || 
            combined.includes('äpple') || combined.includes('banan') ||
            combined.includes('mango')) {
          category = 'fruits';
        } else if (combined.includes('kött') || combined.includes('fläsk') || 
                   combined.includes('nöt') || combined.includes('bacon')) {
          category = 'meat';
        } else if (combined.includes('fisk') || combined.includes('lax') ||
                   combined.includes('torsk') || combined.includes('skaldjur')) {
          category = 'fish';
        } else if (combined.includes('mjölk') || combined.includes('ost') || 
                   combined.includes('grädde') || combined.includes('yoghurt') ||
                   combined.includes('gräddfil')) {
          category = 'dairy';
        } else if (combined.includes('snack') || combined.includes('chips') || 
                   combined.includes('godis') || combined.includes('choklad')) {
          category = 'snacks';
        } else if (combined.includes('bröd') || combined.includes('bulle') ||
                   combined.includes('kaka')) {
          category = 'bread';
        } else if (combined.includes('dryck') || combined.includes('läsk') ||
                   combined.includes('juice') || combined.includes('vatten')) {
          category = 'drinks';
        }
        
        const product = {
          id: `ica-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`,
          image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
          name: item.name,
          details: baseDescription,
          currentPrice: formattedPrice,
          originalPrice: '',
          store: 'ica',  // Lowercase to match store filter
          category: category,
          offerBadge: 'Erbjudande' // Swedish offer badge
        };
        
        return product;
      }).filter(Boolean) as Product[];
      
      // Transform Willys data
      const willysProducts: Product[] = (willysData || []).map((item) => {
        if (!item.name) {
          console.warn("Skipping Willys item without name:", item);
          return null;
        }
        
        // Parse the price string to get the numeric value
        let formattedPrice = 'N/A';
        if (item.price !== null && item.price !== undefined) {
          formattedPrice = `${item.price}:- kr`;
        }
        
        // Original price formatting
        let originalPriceFormatted = '';
        if (item.original_price !== null && item.original_price !== undefined) {
          originalPriceFormatted = `${item.original_price}:- kr`;
        }
        
        // Categorize products based on description keywords
        let category = 'other';
        const lowerDesc = (item.description || '').toLowerCase();
        const lowerName = (item.name || '').toLowerCase();
        
        // Combined check of name and description for better categorization
        const combined = lowerName + ' ' + lowerDesc;
        
        if (combined.includes('grönsak') || combined.includes('frukt') || 
            combined.includes('äpple') || combined.includes('banan') ||
            combined.includes('mango')) {
          category = 'fruits';
        } else if (combined.includes('kött') || combined.includes('fläsk') || 
                   combined.includes('nöt') || combined.includes('bacon') ||
                   combined.includes('kyckl')) {
          category = 'meat';
        } else if (combined.includes('fisk') || combined.includes('lax') ||
                   combined.includes('torsk') || combined.includes('skaldjur')) {
          category = 'fish';
        } else if (combined.includes('mjölk') || combined.includes('ost') || 
                   combined.includes('grädde') || combined.includes('yoghurt') ||
                   combined.includes('gräddfil')) {
          category = 'dairy';
        } else if (combined.includes('snack') || combined.includes('chips') || 
                   combined.includes('godis') || combined.includes('choklad')) {
          category = 'snacks';
        } else if (combined.includes('bröd') || combined.includes('bulle') ||
                   combined.includes('kaka')) {
          category = 'bread';
        } else if (combined.includes('dryck') || combined.includes('läsk') ||
                   combined.includes('juice') || combined.includes('vatten') ||
                   combined.includes('kaffe')) {
          category = 'drinks';
        }
        
        const product = {
          id: `willys-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`,
          image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
          name: item.name,
          details: item.description || 'Ingen beskrivning tillgänglig',
          currentPrice: formattedPrice,
          originalPrice: originalPriceFormatted,
          store: 'willys',  // Important: Ensure lowercase matches the store filter
          category: category,
          offerBadge: item.offer_details || 'Erbjudande' // Swedish offer badge
        };
        
        return product;
      }).filter(Boolean) as Product[];
      
      // Debug log to check data transformation
      if (willysProducts.length > 0) {
        console.log("First transformed Willys product:", willysProducts[0]);
      } else {
        console.log("No Willys products found or transformed");
      }
      
      // Combine all products
      const allProducts = [...icaProducts, ...willysProducts];
      console.log('Total number of products:', allProducts.length);
      console.log('ICA products:', icaProducts.length);
      console.log('Willys products:', willysProducts.length);
      
      setProducts(allProducts);
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
