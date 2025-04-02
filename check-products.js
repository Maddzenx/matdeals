import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Checking products in the Willys Johanneberg table...');
    
    // Fetch products from the database
    const { data: products, error } = await supabase
      .from('Willys Johanneberg')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products.length} products in the database`);
    
    if (products.length > 0) {
      // Display sample products with prices converted from öre to kr
      console.log('\nSample products:');
      
      products.slice(0, 3).forEach((product, index) => {
        // Convert prices from öre to kr
        const priceInKr = product.Price / 100;
        const savingsInKr = product.Savings ? product.Savings / 100 : null;
        
        console.log(`\nProduct ${index + 1}:`);
        console.log(`  Name: ${product['Product Name']}`);
        console.log(`  Description: ${product['Brand and Weight'] || 'N/A'}`);
        console.log(`  Price: ${priceInKr.toFixed(2)} kr (stored as ${product.Price} öre)`);
        
        if (savingsInKr) {
          console.log(`  Savings: ${savingsInKr.toFixed(2)} kr (stored as ${product.Savings} öre)`);
        }
        
        console.log(`  Label: ${product['Label 1'] || 'N/A'}`);
        console.log(`  Image URL: ${product['Product Image'] || 'N/A'}`);
      });
      
      console.log('\nINFO: Products are stored in the database as öre/cents (integers).');
      console.log('To display them as kr/SEK in your frontend, divide the Price and Savings values by 100.');
      console.log('The transformer code has been updated to handle this conversion.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 