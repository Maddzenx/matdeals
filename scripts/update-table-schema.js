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
    console.log('Updating products table schema...');
    
    // First, get the current table structure
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
      
    if (tableInfoError) {
      console.error('Error getting table info:', tableInfoError);
      return;
    }
    
    console.log('Current table structure:', tableInfo);
    
    // Create a new table with the updated schema
    const { error: createTableError } = await supabase.rpc('create_products_table', {
      table_name: 'products_new',
      columns: {
        id: 'SERIAL PRIMARY KEY',
        product_name: 'TEXT NOT NULL',
        description: 'TEXT',
        price: 'TEXT',
        original_price: 'DECIMAL(10,2)',
        image_url: 'TEXT',
        product_url: 'TEXT',
        offer_details: 'TEXT',
        label: 'TEXT',
        savings: 'DECIMAL(10,2)',
        unit_price: 'TEXT',
        purchase_limit: 'TEXT',
        store: 'TEXT NOT NULL',
        store_location: 'TEXT',
        position: 'INTEGER',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
        updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
      }
    });
    
    if (createTableError) {
      console.error('Error creating new table:', createTableError);
      return;
    }
    
    console.log('Successfully created new table');
    
    // Copy data from old table to new table
    const { error: copyDataError } = await supabase.rpc('copy_table_data', {
      source_table: 'products',
      target_table: 'products_new'
    });
    
    if (copyDataError) {
      console.error('Error copying data:', copyDataError);
      return;
    }
    
    console.log('Successfully copied data to new table');
    
    // Drop the old table
    const { error: dropTableError } = await supabase.rpc('drop_table', {
      table_name: 'products'
    });
    
    if (dropTableError) {
      console.error('Error dropping old table:', dropTableError);
      return;
    }
    
    console.log('Successfully dropped old table');
    
    // Rename the new table
    const { error: renameTableError } = await supabase.rpc('rename_table', {
      old_name: 'products_new',
      new_name: 'products'
    });
    
    if (renameTableError) {
      console.error('Error renaming new table:', renameTableError);
      return;
    }
    
    console.log('Successfully renamed new table');
    console.log('Table schema update completed successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 