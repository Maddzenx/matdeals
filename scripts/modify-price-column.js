const { createClient } = require('@supabase/supabase-js');

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
    console.log('Modifying price column in products table...');
    
    // First, create a new column with the desired type
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN price_text TEXT;'
    });
    
    if (addColumnError) {
      console.error('Error adding new price column:', addColumnError);
      return;
    }
    
    console.log('Successfully added new price_text column');
    
    // Copy data from old column to new column
    const { error: copyDataError } = await supabase.rpc('exec_sql', {
      sql: 'UPDATE products SET price_text = CAST(price AS TEXT);'
    });
    
    if (copyDataError) {
      console.error('Error copying data to new column:', copyDataError);
      return;
    }
    
    console.log('Successfully copied data to new column');
    
    // Drop the old column
    const { error: dropColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products DROP COLUMN price;'
    });
    
    if (dropColumnError) {
      console.error('Error dropping old price column:', dropColumnError);
      return;
    }
    
    console.log('Successfully dropped old price column');
    
    // Rename the new column
    const { error: renameColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products RENAME COLUMN price_text TO price;'
    });
    
    if (renameColumnError) {
      console.error('Error renaming new price column:', renameColumnError);
      return;
    }
    
    console.log('Successfully renamed new price column');
    console.log('Price column modification completed successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 