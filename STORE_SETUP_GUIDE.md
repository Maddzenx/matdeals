# Store Integration Guide

This guide explains how to add support for additional stores in your application.

## Step 1: Create a New Store Table in Supabase

1. Log in to the [Supabase Dashboard](https://supabase.com) and select your project
2. Navigate to the SQL Editor
3. Create a new query with the following SQL (replace `STORE_NAME` with your store name):

```sql
-- Create a new table for the store
CREATE TABLE IF NOT EXISTS "STORE_NAME" (
    "Product Name" TEXT NOT NULL,
    "Brand and Weight" TEXT,
    "Price" DECIMAL(10,2),  -- Using decimal for kr/SEK
    "Product Image" TEXT,
    "Product Link" TEXT,
    "Label 1" TEXT,
    "Label 2" TEXT,
    "Label 3" TEXT,
    "Savings" DECIMAL(10,2),  -- Using decimal for kr/SEK
    "Unit Price" TEXT,
    "Purchase Limit" TEXT,
    "Position" INTEGER
);

-- Enable Row Level Security (RLS)
ALTER TABLE "STORE_NAME" ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access on STORE_NAME"
    ON "STORE_NAME"
    FOR SELECT TO public
    USING (true);
```

4. Run the SQL to create the table and set up the RLS policy

## Step 2: Create a Scraper Function

1. Duplicate the existing scraper function for Willys Johanneberg:

```bash
cp supabase/functions/scrape-willys supabase/functions/scrape-STORE_NAME
```

2. Modify the function to scrape the new store:
   - Update the URLs and selectors in the configuration
   - Adjust the HTML parsing logic as needed for the store's webpage
   - Update the product data mapping to match the new store's format

## Step 3: Create a Product Transformer

1. Create a new transformer file at `src/utils/transformers/STORE_NAMETransformer.ts`:

```typescript
import { Product } from "@/data/types";
import { determineProductCategory } from "./determineCategory";

/**
 * Transforms raw STORE_NAME data into standardized product format
 */
export const transformSTORE_NAMEProducts = (storeData: any[]): Product[] => {
  console.log("Transforming STORE_NAME data:", storeData?.length || 0, "items");
  
  if (!storeData || storeData.length === 0) {
    console.warn("No STORE_NAME data to transform");
    return [];
  }
  
  try {
    const transformedProducts = (storeData || []).filter(Boolean).map((item) => {
      if (!item || !item["Product Name"]) {
        console.warn("Skipping STORE_NAME item without name:", item);
        return null;
      }
      
      // Sanitize product name to ensure it's a string
      const productName = String(item["Product Name"]).trim();
      
      // Parse the price to ensure it's a number
      let price = null;
      if (typeof item.Price === 'number') {
        price = item.Price;
      } else if (typeof item.Price === 'string') {
        // Try to parse as float
        const priceStr = String(item.Price).replace(/[^\d,.]/g, '').replace(',', '.');
        price = parseFloat(priceStr);
      }
      
      // Format the price string for display
      let formattedPrice = 'N/A';
      if (price !== null && !isNaN(price)) {
        // Format as Swedish style with comma as decimal separator
        if (Number.isInteger(price)) {
          formattedPrice = `${price}:- kr`;
        } else {
          // For decimal values, use comma as decimal separator (Swedish format)
          const priceStr = price.toFixed(2).replace('.', ',');
          formattedPrice = `${priceStr} kr`;
        }
      } else if (item.Price && typeof item.Price === 'string') {
        // If we couldn't parse it, use the original string if available
        formattedPrice = item.Price;
      }
      
      // Get brand and weight information
      const brandAndWeight = item["Brand and Weight"] ? String(item["Brand and Weight"]).trim() : '';
      
      // Determine product category based on name and brand
      const category = determineProductCategory(productName, brandAndWeight);
      
      // Create a unique product ID
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const productId = `store-name-${timestamp}-${randomStr}`;
      
      // Set store name (lowercase for filtering consistency)
      const store = 'store-name';
      
      // Check if the image URL is valid and use a fallback image
      let imageUrl = item["Product Image"] || 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      if (!imageUrl.startsWith('http')) {
        imageUrl = 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      }
      
      return {
        id: productId,
        image: imageUrl,
        name: productName,
        details: brandAndWeight || 'Ingen beskrivning tillgänglig',
        currentPrice: formattedPrice,
        originalPrice: item["Unit Price"] || '',
        store: store,
        category: category,
        offerBadge: item["Label 1"] || 'Erbjudande'
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed STORE_NAME products:", transformedProducts.length);
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming STORE_NAME products:", error);
    return [];
  }
};
```

## Step 4: Update Product Fetching Hook

1. Modify `src/hooks/useProductFetching.tsx` to add a fetch function for the new store:

```typescript
const fetchSTORE_NAMEProducts = useCallback(async (showNotifications = false) => {
  console.log("Fetching products from Supabase STORE_NAME table...");
  
  try {
    const { data: storeData, error: storeError } = await supabase
      .from('STORE_NAME')  // Use your table name here
      .select('*');
      
    if (storeError) {
      console.error("Supabase STORE_NAME query error:", storeError);
      throw storeError;
    }
    
    console.log("Raw STORE_NAME data:", storeData?.length || 0, "items");
    return storeData || [];
  } catch (error) {
    console.error("Error in fetchSTORE_NAMEProducts:", error);
    return [];
  }
}, []);

// Then add it to the refreshProducts function:
const refreshProducts = useCallback(async (showNotifications = false) => {
  try {
    setLoading(true);
    setError(null);
    
    console.log("Starting refreshProducts function...");
    
    const willysJohannebergData = await fetchWillysJohannebergProducts(showNotifications);
    const newStoreData = await fetchSTORE_NAMEProducts(showNotifications);
    
    console.log(`Refreshed products - Willys Johanneberg: ${willysJohannebergData.length}, STORE_NAME: ${newStoreData.length}`);
    
    return { 
      willysJohannebergData,
      newStoreData
      // other stores...
    };
  } catch (error) {
    console.error("Error in refreshProducts:", error);
    setError(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  } finally {
    setLoading(false);
  }
}, [fetchWillysJohannebergProducts, fetchSTORE_NAMEProducts]);

// Finally, include it in the return statement
return {
  fetchSTORE_NAMEProducts,
  fetchWillysJohannebergProducts,
  // other fetchers...
  refreshProducts,
  loading,
  setLoading,
  error,
  setError
};
```

## Step 5: Update Supabase Products Hook

1. Modify `src/hooks/useSupabaseProducts.tsx` to transform the new store data:

```typescript
import { transformSTORE_NAMEProducts } from "@/utils/transformers";

// Then in the useEffect that processes data:
useEffect(() => {
  if (data) {
    try {
      console.log("Transforming data from query cache");
      
      // Transform Willys Johanneberg products
      const willysJohannebergProducts = transformWillysJohannebergProducts(data.willysJohannebergData || []);
      console.log(`Transformed Willys Johanneberg products: ${willysJohannebergProducts.length}`);
      
      // Transform new store products
      const newStoreProducts = transformSTORE_NAMEProducts(data.newStoreData || []);
      console.log(`Transformed STORE_NAME products: ${newStoreProducts.length}`);
      
      // Combine all products
      const allProducts = [
        ...willysJohannebergProducts,
        ...newStoreProducts
        // Add more stores as needed
      ];
      
      setProducts(allProducts);
    } catch (transformError) {
      console.error("Error transforming products:", transformError);
      toast.error("Kunde inte transformera produktdata", {
        description: "Ett fel uppstod vid behandling av produktdata"
      });
    }
  } else {
    console.log("No data available for transformation");
  }
}, [data]);
```

## Step 6: Create a Script to Store Products

1. Create a script to store products for the new store:

```javascript
// store-STORE_NAME-products.js
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
    console.log('Triggering the scraper to get STORE_NAME product data...');
    
    // Invoke the scrape function
    const { data: scraperResponse, error: scraperError } = await supabase.functions.invoke('scrape-STORE_NAME', {
      body: { 
        forceRefresh: true, 
        source: "manual-trigger"
      }
    });
    
    if (scraperError) {
      console.error('Error invoking scraper:', scraperError);
      return;
    }
    
    console.log('Scraper response received with', scraperResponse.products?.length || 0, 'products');
    
    if (!scraperResponse.products || scraperResponse.products.length === 0) {
      console.error('No products returned from scraper');
      return;
    }
    
    console.log('Processing products from scraper...');
    
    // First, clear existing data
    const { error: deleteError } = await supabase
      .from('STORE_NAME')
      .delete()
      .gt('Position', 0);
      
    if (deleteError) {
      console.error('Error clearing existing products:', deleteError);
    } else {
      console.log('Successfully cleared existing products');
    }
    
    // Process products to the correct format
    const processedProducts = scraperResponse.products.map((product, index) => {
      // Parse prices as kr/SEK (decimal)
      const priceText = typeof product.price === 'string' ? product.price : String(product.price || 0);
      const originalPriceText = typeof product.original_price === 'string' ? product.original_price : String(product.original_price || 0);
      
      const priceClean = priceText.replace(',', '.').replace('kr', '').trim();
      const originalPriceClean = originalPriceText.replace(',', '.').replace('kr', '').trim();
      
      const priceVal = parseFloat(priceClean) || 0;
      const originalPriceVal = parseFloat(originalPriceClean) || 0;
      
      // Store as decimal (kr/SEK)
      const savings = originalPriceVal > priceVal ? originalPriceVal - priceVal : null;
      
      return {
        "Product Name": product.name || product['Product Name'] || 'Unknown Product',
        "Brand and Weight": product.description || product['Brand and Weight'] || null,
        "Price": priceVal,
        "Product Image": product.image_url || product['Product Image'] || null,
        "Product Link": null,
        "Label 1": product.offer_details || "Veckans erbjudande",
        "Label 2": null,
        "Label 3": null,
        "Savings": savings,
        "Unit Price": product.comparison_price || null,
        "Purchase Limit": null,
        "Position": index + 1
      };
    });
    
    console.log(`Processed ${processedProducts.length} products`);
    
    // Insert products
    const { data, error } = await supabase
      .from('STORE_NAME')
      .insert(processedProducts)
      .select();
      
    if (error) {
      console.error('Error inserting products:', error);
      // Try batch insertion if needed
    } else {
      console.log(`Successfully inserted ${data.length} products`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();
```

## Step 7: Deploy the Scraper Function

1. Deploy the scraper function to Supabase:

```bash
cd supabase/functions/scrape-STORE_NAME
supabase functions deploy scrape-STORE_NAME --project-ref YOUR_PROJECT_REF
```

## Step 8: Test the Integration

1. Run the storage script to test the scraper and storage:

```bash
node store-STORE_NAME-products.js
```

2. Check if the products appear in the Supabase table
3. Test the frontend by navigating to the products page

## Summary

By following these steps, you can add support for additional stores to your application. The key components are:

1. Create a table in Supabase with appropriate RLS policies
2. Create a scraper function to fetch product data
3. Create a transformer to convert raw data to your standard product format
4. Update the product fetching hooks to include the new store
5. Create a script to trigger the scraper and store products

Remember to adjust the code as needed for each specific store's HTML structure and data format. 