#!/bin/bash

# Script to deploy scrapers to Supabase Edge Functions

echo "Deploying scrapers to Supabase..."

# Step 1: Deploy shared utilities
echo "Deploying shared utilities..."
mkdir -p supabase/functions/shared
# Already created shared/cors.ts and shared/product-storage.ts

# Step 2: Deploy the Willys scraper
echo "Deploying Willys scraper..."
cd supabase/functions
supabase functions deploy scrape-willys --no-verify-jwt

echo "Deployment completed!"
echo "To test the scrapers, run: node store-unified-products.js" 