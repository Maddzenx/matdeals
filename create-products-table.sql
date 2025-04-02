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

-- Keep the Willys Johanneberg table for backward compatibility
-- You can migrate data from it later if needed
-- ALTER TABLE "Willys Johanneberg" RENAME TO "willys_johanneberg_legacy";

-- Add a comment to the table
COMMENT ON TABLE "products" IS 'Unified table for storing products from all grocery stores'; 