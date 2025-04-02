import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for migrations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Read migration SQL
    const migrationSql = await fs.readFile('supabase/migrations/20240320000000_create_products_table.sql', 'utf8');

    // Split the SQL into separate statements
    const statements = migrationSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

      const { error } = await supabase.rpc('execute_sql', { sql: statement });

      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        
        // If this is a "table doesn't exist" error for DROP TABLE, we can ignore it
        if (statement.toUpperCase().includes('DROP TABLE') && error.message.includes('does not exist')) {
          console.log('Ignoring error for DROP TABLE statement (table does not exist)');
          continue;
        }
      } else {
        console.log(`Successfully executed statement ${i + 1}`);
      }
    }

    console.log('Migration completed');

    // Verify the products table exists now
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error verifying products table:', error);
    } else {
      console.log('Products table created successfully:');
      console.log(data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 