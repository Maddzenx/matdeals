-- Add new columns to Willys Johanneberg table
ALTER TABLE "Willys Johanneberg"
ADD COLUMN IF NOT EXISTS is_kortvara BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS additional_info TEXT; 