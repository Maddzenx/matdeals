-- Create the Willys Johanneberg table
CREATE TABLE "Willys Johanneberg" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage INTEGER,
    image_url TEXT,
    category TEXT,
    brand TEXT,
    unit TEXT,
    quantity DECIMAL(10,2),
    store TEXT DEFAULT 'Willys Johanneberg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX willys_name_idx ON "Willys Johanneberg"(name);
CREATE INDEX willys_category_idx ON "Willys Johanneberg"(category);
CREATE INDEX willys_price_idx ON "Willys Johanneberg"(price);

-- Enable Row Level Security
ALTER TABLE "Willys Johanneberg" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read products
CREATE POLICY "Allow authenticated users to read Willys products" 
    ON "Willys Johanneberg" FOR SELECT 
    TO authenticated 
    USING (true);

-- Create policy to allow authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert Willys products" 
    ON "Willys Johanneberg" FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_willys_updated_at
    BEFORE UPDATE ON "Willys Johanneberg"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 