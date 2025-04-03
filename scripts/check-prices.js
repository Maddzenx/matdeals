require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrices() {
    try {
        // Fetch all products
        const { data: products, error } = await supabase
            .from('products')
            .select('product_name, price, offer_details')
            .order('product_name');

        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        console.log('\nChecking prices for products:');
        console.log('----------------------------------------');
        
        products.forEach(product => {
            console.log(`\nProduct: ${product.product_name}`);
            console.log(`Price in database: ${product.price}`);
            console.log(`Offer details: ${product.offer_details}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPrices(); 