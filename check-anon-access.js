import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client with anonymous key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Checking if products can be accessed using the anonymous key...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anonymous Key available:', supabaseKey ? 'Yes' : 'No');
    
    // Get products from the Willys Johanneberg table
    const { data: willysData, error: willysError } = await supabase
      .from('Willys Johanneberg')
      .select('*')
      .limit(10);
    
    if (willysError) {
      console.error('Error querying Willys Johanneberg table with anonymous key:', willysError);
    } else {
      console.log(`Found ${willysData.length} products with anonymous key:`);
      willysData.forEach((product, index) => {
        console.log(`Product ${index + 1}: ${product['Product Name']}, Price: ${product.Price}`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 