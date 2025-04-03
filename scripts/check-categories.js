require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Fetching products with categories...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('product_name, category')
      .order('product_name');
      
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log('\nSample products with their categories:');
    console.log('----------------------------------------');
    products.slice(0, 10).forEach(product => {
      console.log(`${product.product_name}: ${product.category || 'No category'}`);
    });
    
    // Calculate category distribution
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category || 'No category';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nCategory distribution:');
    console.log('----------------------------------------');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count} products`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 