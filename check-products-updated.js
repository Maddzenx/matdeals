import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client with service role key for more permissions
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Checking Willys Johanneberg table for products using service role key...');
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Service Key available: ${supabaseKey ? "Yes" : "No"}`);
    
    // Try to get the table structure first
    console.log('Getting table structure...');
    const { data: tablesData, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.error('Error getting tables:', tablesError);
    } else {
      console.log('Available tables:', tablesData);
    }
    
    // Get products from the Willys Johanneberg table
    const { data: willysData, error: willysError } = await supabase
      .from('Willys Johanneberg')
      .select('*')
      .limit(10);
    
    if (willysError) {
      console.error('Error querying Willys Johanneberg table:', willysError);
    } else {
      console.log(`Found ${willysData.length} products in Willys Johanneberg table:`);
      willysData.forEach((product, index) => {
        console.log(`Product ${index + 1}: ${product['Product Name']}, Price: ${product.Price}`);
      });
    }
    
    // Try a direct SQL query
    console.log('Trying direct SQL query...');
    try {
      const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', { 
        sql: 'SELECT * FROM "Willys Johanneberg" LIMIT 10' 
      });
      
      if (sqlError) {
        console.error('Error with SQL query:', sqlError);
      } else {
        console.log('SQL query result:', sqlData);
      }
    } catch (err) {
      console.error('Exception with SQL query:', err);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 