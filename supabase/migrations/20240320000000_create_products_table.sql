-- Drop the Willys Johanneberg table
DROP TABLE IF EXISTS "Willys Johanneberg";

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    image_url TEXT,
    product_url TEXT,
    offer_details TEXT,
    label TEXT,
    savings DECIMAL(10,2),
    unit_price TEXT,
    purchase_limit TEXT,
    store TEXT NOT NULL,
    store_location TEXT,
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create an index on store and store_location for faster queries
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store, store_location);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
    ON products FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to modify"
    ON products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true); 