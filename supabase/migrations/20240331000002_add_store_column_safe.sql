-- Check if the column exists first
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Willys Johanneberg' 
        AND column_name = 'store'
    ) THEN
        ALTER TABLE "Willys Johanneberg" ADD COLUMN store TEXT NOT NULL DEFAULT 'Johanneberg';
    END IF;
END $$;

-- Update existing rows
UPDATE "Willys Johanneberg" SET store = 'Johanneberg' WHERE store IS NULL; 