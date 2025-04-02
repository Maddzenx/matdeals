import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Define the Product type
export interface Product {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  category: string;
  offerBadge: string;
}

// Create a hook for accessing unified products
export function useUnifiedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  // Function to transform raw product data
  const transformProduct = useCallback((item: any): Product => {
    // Create a stable ID
    const id = item.id || `${item.store}-${item.store_location}-${item.position}-${Date.now()}`;
    
    // Format price
    let formattedPrice = 'N/A';
    if (item.price !== null && !isNaN(item.price)) {
      if (Number.isInteger(item.price)) {
        formattedPrice = `${item.price}:- kr`;
      } else {
        const priceStr = item.price.toFixed(2).replace('.', ',');
        formattedPrice = `${priceStr} kr`;
      }
    }
    
    // Determine category
    const category = determineCategory(item.product_name, item.description);
    
    return {
      id,
      image: item.image_url || 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg',
      name: item.product_name,
      details: item.description || 'Ingen beskrivning tillgänglig',
      currentPrice: formattedPrice,
      originalPrice: item.unit_price || '',
      store: item.store,
      category,
      offerBadge: item.offer_details || item.label || 'Erbjudande'
    };
  }, []);
  
  // Basic category determination
  const determineCategory = useCallback((name: string, description?: string): string => {
    const normalizedName = (name || '').toLowerCase();
    const normalizedDesc = (description || '').toLowerCase();
    
    if (normalizedName.includes('mjölk') || normalizedName.includes('yoghurt') || normalizedName.includes('ost')) {
      return 'mejeriprodukter';
    } else if (normalizedName.includes('kött') || normalizedName.includes('fläsk') || normalizedName.includes('kyckling')) {
      return 'kött';
    } else if (normalizedName.includes('frukt') || normalizedName.includes('äpple') || normalizedName.includes('banan')) {
      return 'frukt';
    } else if (normalizedName.includes('grönsak') || normalizedName.includes('tomat') || normalizedName.includes('gurka')) {
      return 'grönsaker';
    } else if (normalizedName.includes('bröd') || normalizedName.includes('bulle')) {
      return 'bröd';
    } else {
      return 'övrigt';
    }
  }, []);
  
  // Fetch all products
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} products from database`);
      
      if (!data || data.length === 0) {
        console.log('No products found in database');
        setProducts([]);
        return;
      }
      
      // Transform products
      const transformedProducts = data.map(transformProduct);
      console.log('Transformed products:', transformedProducts);
      
      // Update state
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      toast.error('Kunde inte hämta produkter. Ett fel uppstod vid hämtning av produkter.');
    } finally {
      setLoading(false);
    }
  }, [supabase, transformProduct]);
  
  // Trigger initial fetch
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);
  
  // Return products and utility functions
  return {
    products,
    loading,
    error,
    refreshProducts: fetchAllProducts
  };
} 