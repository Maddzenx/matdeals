-- Drop existing table
DROP TABLE IF EXISTS "Willys Johanneberg";

-- Create table with all needed columns
CREATE TABLE "Willys Johanneberg" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    is_kortvara BOOLEAN DEFAULT FALSE,
    additional_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
); 