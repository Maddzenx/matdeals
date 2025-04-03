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
    console.log('Adding category column to products table...');
    
    // Add category column
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;'
    });
    
    if (addColumnError) {
      console.error('Error adding category column:', addColumnError);
      return;
    }
    
    console.log('Successfully added category column');
    
    // Create index for category
    const { error: createIndexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);'
    });
    
    if (createIndexError) {
      console.error('Error creating category index:', createIndexError);
      return;
    }
    
    console.log('Successfully created category index');
    
    // Verify the changes
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
      
    if (tableInfoError) {
      console.error('Error verifying changes:', tableInfoError);
    } else {
      console.log('Table structure verified:', tableInfo);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 