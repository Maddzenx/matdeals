-- Create scrape_logs table
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store VARCHAR NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  products_scraped INTEGER DEFAULT 0
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_scrape_logs_completed_at ON scrape_logs(completed_at);

-- Add function to log scraping completion
CREATE OR REPLACE FUNCTION log_scrape_completion(
  p_store VARCHAR,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_products_scraped INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO scrape_logs (
    store,
    success,
    error_message,
    products_scraped
  ) VALUES (
    p_store,
    p_success,
    p_error_message,
    p_products_scraped
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql; 