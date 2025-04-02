import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use the dashboard query interface or SQL editor to run this SQL
const alterTableSQL = `
-- This cannot be run through the API, you need to run it in the SQL editor in the Supabase dashboard
-- Alter Price column to use DECIMAL type
ALTER TABLE "Willys Johanneberg" ALTER COLUMN "Price" TYPE DECIMAL(10,2);

-- Alter Savings column to use DECIMAL type
ALTER TABLE "Willys Johanneberg" ALTER COLUMN "Savings" TYPE DECIMAL(10,2);
`;

async function main() {
  try {
    console.log('You need to modify the table schema by running the following SQL in the Supabase dashboard:');
    console.log(alterTableSQL);
    
    console.log('\nUse these steps:');
    console.log('1. Log in to your Supabase dashboard at https://supabase.com');
    console.log('2. Go to your project');
    console.log('3. Click on "SQL Editor" in the left sidebar');
    console.log('4. Create a new query');
    console.log('5. Paste the SQL above');
    console.log('6. Click "Run"');
    console.log('\nAfter running the SQL, you can run store-scraper-products.js again to store prices as decimals.');
    
    // Let's check the current table structure
    console.log('\nHere is what we need to modify:');
    try {
      // Try querying current schema
      const { data: schemaData, error: schemaError } = await supabase.rpc('get_table_details', { 
        table_name: 'Willys Johanneberg' 
      });
      
      if (schemaError) {
        console.error('Error getting table schema:', schemaError);
      } else {
        console.log('Current schema:', schemaData);
      }
    } catch (err) {
      console.error('Exception getting schema:', err);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 