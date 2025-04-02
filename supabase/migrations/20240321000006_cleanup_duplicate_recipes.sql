-- Delete duplicate recipes, keeping only the most recent version of each recipe
WITH ranked_recipes AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM recipes
)
DELETE FROM recipes 
WHERE id IN (
  SELECT id 
  FROM ranked_recipes 
  WHERE rn > 1
); 