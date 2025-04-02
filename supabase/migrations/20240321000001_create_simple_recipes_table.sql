-- Drop the existing recipes table if it exists
DROP TABLE IF EXISTS recipes;

-- Create a simpler recipes table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL,
    instructions TEXT[] NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX recipes_category_idx ON recipes(category);

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