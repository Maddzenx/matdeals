import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for upserts

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Storing test products in Willys Johanneberg table...');
    
    // First, clear existing data
    const { error: deleteError } = await supabase
      .from('Willys Johanneberg')
      .delete()
      .gt('Position', 0);
      
    if (deleteError) {
      console.error('Error clearing existing products:', deleteError);
    } else {
      console.log('Successfully cleared existing products');
    }
    
    // Create sample products
    const sampleProducts = [
      {
        "Product Name": "Äpple Royal Gala",
        "Brand and Weight": "Willys, Italien, Klass 1",
        "Price": 2490,
        "Product Image": "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
        "Product Link": null,
        "Label 1": "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": 500,
        "Unit Price": "24.90 kr/kg",
        "Purchase Limit": null,
        "Position": 1
      },
      {
        "Product Name": "Färsk Kycklingfilé",
        "Brand and Weight": "Kronfågel, Sverige, 700-925g",
        "Price": 8990,
        "Product Image": "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
        "Product Link": null,
        "Label 1": "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": 2000,
        "Unit Price": "89.90 kr/kg",
        "Purchase Limit": null,
        "Position": 2
      },
      {
        "Product Name": "Kavli Mjukost",
        "Brand and Weight": "Willys, Flera smaker, 275g",
        "Price": 2990,
        "Product Image": "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
        "Product Link": null,
        "Label 1": "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": 500,
        "Unit Price": "108.73 kr/kg",
        "Purchase Limit": null,
        "Position": 3
      }
    ];
    
    // Insert products
    const { data, error } = await supabase
      .from('Willys Johanneberg')
      .insert(sampleProducts)
      .select();
      
    if (error) {
      console.error('Error inserting products:', error);
    } else {
      console.log(`Successfully inserted ${data.length} products`);
      console.log('Inserted products:', data);
    }
    
    // Verify products were inserted
    const { data: checkData, error: checkError } = await supabase
      .from('Willys Johanneberg')
      .select('*');
      
    if (checkError) {
      console.error('Error checking products:', checkError);
    } else {
      console.log(`Found ${checkData.length} products in database after insertion`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main(); 