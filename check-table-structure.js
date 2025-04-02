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
    console.log('Checking table structure of "Willys Johanneberg"...');
    
    // Query column information from PostgreSQL information schema
    const { data, error } = await supabase.rpc('inspect_table_columns', {
      target_table: 'Willys Johanneberg'
    });
    
    if (error) {
      console.error('Error querying table structure:', error);
      console.log('\nAlternative approach: Running direct SQL query...');
      
      // Alternative approach: Use direct SQL query
      const { data: sqlData, error: sqlError } = await supabase.from('pg_catalog.pg_tables')
        .select('*')
        .eq('tablename', 'Willys Johanneberg');
      
      if (sqlError) {
        console.error('SQL query error:', sqlError);
      } else {
        console.log('Table info:', sqlData);
      }
      
      // Try to insert a test product to see exact error
      console.log('\nTrying to insert a test product with decimal value...');
      const testProduct = {
        "Product Name": "Test Product",
        "Brand and Weight": "Test Brand",
        "Price": 19.99,
        "Product Image": null,
        "Product Link": null,
        "Label 1": "Test Label",
        "Label 2": null,
        "Label 3": null,
        "Savings": 5.50,
        "Unit Price": null,
        "Purchase Limit": null,
        "Position": 999
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('Willys Johanneberg')
        .insert(testProduct)
        .select();
        
      if (insertError) {
        console.error('Insert test error (full details):', insertError);
      } else {
        console.log('Successfully inserted test product:', insertData);
      }
    } else {
      console.log('Table structure:', data);
    }
    
    // Execute manual query to get column types
    console.log('\nAttempting direct column information query...');
    const { data: columnData, error: columnError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'Willys Johanneberg'
      `
    });
    
    if (columnError) {
      console.error('Column query error:', columnError);
    } else {
      console.log('Column information:', columnData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 