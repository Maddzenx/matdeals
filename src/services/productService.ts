import { createClient } from '@supabase/supabase-js';
import { Product } from '../types/product';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

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