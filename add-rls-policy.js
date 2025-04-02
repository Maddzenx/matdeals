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

async function main() {
  try {
    console.log('Adding RLS policy to Willys Johanneberg table...');
    
    // First, enable RLS on the table
    console.log('Enabling RLS on Willys Johanneberg table...');
    
    // Try to use RPC function
    try {
      const { data: enableRlsData, error: enableRlsError } = await supabase.rpc('execute_sql', { 
        sql: 'ALTER TABLE "Willys Johanneberg" ENABLE ROW LEVEL SECURITY' 
      });
      
      if (enableRlsError) {
        console.error('Error enabling RLS:', enableRlsError);
      } else {
        console.log('Successfully enabled RLS on Willys Johanneberg table');
      }
    } catch (err) {
      console.error('Exception enabling RLS:', err);
      console.log('Trying alternative approach with alter table statement...');
    }
    
    // Now add a public read policy
    console.log('Adding public read policy...');
    
    try {
      const { data: policyData, error: policyError } = await supabase.rpc('execute_sql', { 
        sql: `CREATE POLICY "Allow public read access on Willys Johanneberg" 
              ON "Willys Johanneberg" 
              FOR SELECT TO public 
              USING (true)` 
      });
      
      if (policyError) {
        console.error('Error adding public read policy:', policyError);
      } else {
        console.log('Successfully added public read policy to Willys Johanneberg table');
      }
    } catch (err) {
      console.error('Exception adding read policy:', err);
      console.log('Trying alternative approach with SQL statement...');
    }
    
    // Check if we can now read the table with the anon key
    console.log('Testing read access with anon key...');
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const { data: readData, error: readError } = await anonClient
      .from('Willys Johanneberg')
      .select('*')
      .limit(3);
      
    if (readError) {
      console.error('Error reading with anon key:', readError);
    } else {
      console.log(`Successfully read ${readData.length} rows with anon key:`);
      readData.forEach((row, i) => {
        console.log(`Row ${i+1}: ${row['Product Name']}`);
      });
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 