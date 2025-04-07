-- Add unique constraint on title column
ALTER TABLE recipes ADD CONSTRAINT recipes_title_key UNIQUE (title); 