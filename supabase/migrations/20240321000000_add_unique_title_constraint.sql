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
TRUNCATE TABLE recipes;

-- Insert unique recipes back
INSERT INTO recipes (id, title, description, instructions, category, ingredients, created_at)
SELECT id, title, description, instructions, category, ingredients, created_at
FROM temp_unique_recipes;

-- Drop the temporary table
DROP TABLE temp_unique_recipes;

-- Now add the unique constraint
ALTER TABLE recipes ADD CONSTRAINT recipes_title_key UNIQUE (title); 