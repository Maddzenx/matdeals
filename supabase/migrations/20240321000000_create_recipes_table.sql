-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL,
    instructions TEXT[] NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    tags TEXT[],
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    servings INTEGER,
    prep_time INTEGER,
    cook_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes(category);

-- Create index on tags for faster filtering
CREATE INDEX IF NOT EXISTS recipes_tags_idx ON recipes USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read recipes
CREATE POLICY "Allow authenticated users to read recipes" 
    ON recipes FOR SELECT 
    TO authenticated 
    USING (true);

-- Create policy to allow authenticated users to insert recipes
CREATE POLICY "Allow authenticated users to insert recipes" 
    ON recipes FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create policy to allow authenticated users to update recipes
CREATE POLICY "Allow authenticated users to update recipes" 
    ON recipes FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete recipes
CREATE POLICY "Allow authenticated users to delete recipes" 
    ON recipes FOR DELETE 
    TO authenticated 
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 