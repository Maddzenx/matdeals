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
    console.log('Triggering Willys scraper...');
    
    // Invoke the scrape-willys function
    const { data, error } = await supabase.functions.invoke('scrape-willys', {
      body: { 
        forceRefresh: true, 
        source: "manual-trigger",
        target: "willys"
      }
    });
    
    if (error) {
      console.error('Error invoking scraper:', error);
      return;
    }
    
    console.log('Scraper response:', data);

    // Check if products were stored successfully
    const { data: productsData, error: productsError } = await supabase
      .from('Willys Johanneberg')
      .select('count(*)');
    
    if (productsError) {
      console.error('Error checking products:', productsError);
    } else {
      console.log('Products count in database:', productsData);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 