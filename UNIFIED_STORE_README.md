# Unified Store Product System

This document provides instructions for setting up and using the unified product system for your grocery deals application.

## Overview

The unified system allows you to:
1. Store products from multiple stores in a single table
2. Use the same scraper code structure for any store
3. Access products through a consistent API
4. Filter products by store, location, and category

## Setup Instructions

### 1. Create the Products Table

First, you need to create the unified `products` table in your Supabase database:

1. Log in to your [Supabase Dashboard](https://supabase.com)
2. Navigate to your project
3. Click on the "SQL Editor" in the left sidebar
4. Create a new query
5. Paste the following SQL:

```sql
-- Create a unified products table for all stores
CREATE TABLE IF NOT EXISTS "products" (
    "id" SERIAL PRIMARY KEY,
    "product_name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "original_price" DECIMAL(10,2),
    "image_url" TEXT,
    "product_url" TEXT,
    "offer_details" TEXT,
    "label" TEXT,
    "savings" DECIMAL(10,2),
    "unit_price" TEXT,
    "purchase_limit" TEXT,
    "store" TEXT NOT NULL,
    "store_location" TEXT,
    "position" INTEGER,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_store ON "products" (store);

-- Enable Row Level Security (RLS)
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access on products"
    ON "products"
    FOR SELECT TO public
    USING (true);
    
-- Create a policy to allow service role to insert/update/delete
CREATE POLICY "Allow service role full access on products"
    ON "products"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
```

6. Click "Run" to create the table

### 2. Deploy the Scraper Functions

Deploy the scraper functions to Supabase:

```bash
# Make the deployment script executable
chmod +x deploy-scrapers.sh

# Run the deployment script
./deploy-scrapers.sh
```

This will deploy the following functions:
- `scrape-willys` - Scrapes products from Willys
- Any other scrapers you create in the future

### 3. Migrate Existing Products

If you have existing products in the `Willys Johanneberg` table, you can migrate them to the unified `products` table:

```bash
node store-unified-products.js
```

This script will:
1. Check if the `products` table exists
2. Fetch products from the `Willys Johanneberg` table
3. Convert prices from öre/cents (integers) to kr/SEK (decimals)
4. Store the products in the unified `products` table

### 4. Frontend Integration

Use the `useUnifiedProducts` hook in your frontend components:

```jsx
import { useUnifiedProducts } from '@/hooks/useUnifiedProducts';

function ProductsPage() {
  const { products, loading, error, refreshProducts } = useUnifiedProducts();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Products</h1>
      <button onClick={refreshProducts}>Refresh</button>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.details}</p>
            <div className="price">{product.currentPrice}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

For a more complete implementation, use the `UnifiedProductList` component:

```jsx
import { UnifiedProductList } from '@/components/UnifiedProductList';

function DealsPage() {
  return (
    <div>
      <h1>Grocery Deals</h1>
      <UnifiedProductList />
    </div>
  );
}
```

## Adding New Stores

To add a new store, follow these steps:

1. Create a new scraper function:
   ```bash
   cp -r supabase/functions/scrape-willys supabase/functions/scrape-new-store
   ```

2. Update the scraper to target the new store's website

3. Deploy the scraper:
   ```bash
   cd supabase/functions
   supabase functions deploy scrape-new-store --no-verify-jwt
   ```

4. Update your store-unified-products.js to trigger the new scraper

5. Test the scraper:
   ```bash
   node store-unified-products.js
   ```

## Troubleshooting

If you encounter issues:

1. Check the Supabase logs for the function:
   ```bash
   cd supabase/functions
   supabase functions logs scrape-willys
   ```

2. Make sure your Supabase service role key has permissions to execute functions

3. Verify that the products table exists and has the correct schema

4. Check that the RLS policies are set correctly for the products table 