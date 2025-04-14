
import { createClient } from '@supabase/supabase-js';
import { Product } from '../types/product';

// Use hardcoded values for deployment reliability
const supabaseUrl = 'https://rnccetwpkhskcaxsqrig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuY2NldHdwa2hza2NheHNxcmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTY2ODgsImV4cCI6MjA1NjU5MjY4OH0.sRbjsz0pzA34GPrGg6qZsjfOa-EGEq8DKjsX6GG01PE';

console.log('Initializing Supabase client with:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching all products...');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  console.log('Fetched products:', data);
  return data || [];
};

export const getProductsByStore = async (store: string): Promise<Product[]> => {
  console.log('Fetching products for store:', store);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store', store)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by store:', error);
    throw error;
  }

  console.log('Fetched products for store:', data);
  return data || [];
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  console.log('Fetching products for category:', category);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  console.log('Fetched products for category:', data);
  return data || [];
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  console.log('Searching products with query:', query);
  
  if (!query || query.trim() === '') {
    return getProducts();
  }
  
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`product_name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},offer_details.ilike.${searchTerm}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  console.log('Found products:', data?.length || 0);
  return data || [];
};
