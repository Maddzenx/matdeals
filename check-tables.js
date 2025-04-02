import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Check if products table exists and its contents
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('Error querying products table:', productsError);
    } else {
      console.log('Products table exists with data:');
      console.log(productsData);
    }

    // Check if Willys Johanneberg table exists and its contents
    const { data: willysData, error: willysError } = await supabase
      .from('Willys Johanneberg')
      .select('*')
      .limit(5);
    
    if (willysError) {
      console.error('Error querying Willys Johanneberg table:', willysError);
    } else {
      console.log('Willys Johanneberg table exists with data:');
      console.log(willysData);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 