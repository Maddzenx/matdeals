const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(migrationFile) {
  try {
    console.log(`Applying migration: ${migrationFile}`);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error applying migration ${migrationFile}:`, error);
      return false;
    }
    
    console.log(`Successfully applied migration: ${migrationFile}`);
    return true;
  } catch (error) {
    console.error(`Error applying migration ${migrationFile}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Apply migrations in order
    const migrations = [
      '20240322000001_create_exec_sql_function.sql',
      '20240322000000_alter_price_column.sql'
    ];
    
    for (const migration of migrations) {
      const success = await applyMigration(migration);
      if (!success) {
        console.error(`Failed to apply migration: ${migration}`);
        process.exit(1);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main(); 