-- First, create a temporary table to store unique recipes
CREATE TEMP TABLE temp_unique_recipes AS
SELECT DISTINCT ON (LOWER(title)) 
  id,
  title,
  description,
  instructions,
  category,
  ingredients,
  created_at
FROM recipes
ORDER BY LOWER(title), created_at DESC;

-- Clear the recipes table
TRUNCATE TABLE recipes CASCADE;

-- Insert unique recipes back
INSERT INTO recipes (id, title, description, instructions, category, ingredients, created_at)
SELECT id, title, description, instructions, category, ingredients, created_at
FROM temp_unique_recipes;

-- Drop the temporary table
DROP TABLE temp_unique_recipes;

-- Now add the unique constraint
ALTER TABLE recipes ADD CONSTRAINT recipes_title_key UNIQUE (title);

-- Create trigger function
CREATE OR REPLACE FUNCTION prevent_duplicate_recipe_titles()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM recipes 
    WHERE LOWER(title) = LOWER(NEW.title) 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Recipe with similar title already exists';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_duplicate_recipe_titles ON recipes;
CREATE TRIGGER check_duplicate_recipe_titles
  BEFORE INSERT OR UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_recipe_titles(); 