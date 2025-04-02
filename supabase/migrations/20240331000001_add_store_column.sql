-- Add store column with NOT NULL constraint and default value
ALTER TABLE "Willys Johanneberg" ADD COLUMN store TEXT NOT NULL DEFAULT 'Johanneberg';

-- Set existing rows to have 'Johanneberg' as store value
UPDATE "Willys Johanneberg" SET store = 'Johanneberg' WHERE store IS NULL; 