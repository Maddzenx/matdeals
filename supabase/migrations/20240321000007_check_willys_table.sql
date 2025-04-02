-- Check if table exists and its structure
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'Willys Johanneberg'
);

-- List columns in the table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'Willys Johanneberg'; 