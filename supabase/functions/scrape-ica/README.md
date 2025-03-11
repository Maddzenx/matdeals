
# ICA Scraper Function Documentation

## Overview

This Supabase Edge Function scrapes product offers from ICA grocery store website and stores them in a Supabase database. The scraper is designed to be robust against HTML structure changes by using multiple selector strategies.

## Architecture

The scraper is organized into modular components:

```
scrape-ica/
├── index.ts                # Main entry point
├── dom-utils.ts            # HTML parsing utilities
├── products-extractor.ts   # Product extraction orchestration 
├── supabase-client.ts      # Database interface
├── processors/             # Product processing
│   └── card-processor.ts   # Individual product card processing
├── extractors/             # Data extraction utilities
│   ├── name-extractor.ts   # Product name extraction
│   ├── description-extractor.ts # Product description extraction 
│   ├── price-extractor.ts  # Product price extraction
│   └── image-extractor.ts  # Product image extraction
└── types/                  # Type definitions
    └── product.ts          # Product interface
```

## How It Works

### 1. Entry Point (`index.ts`)

The main function orchestrates the scraping process:

1. Handles HTTP requests and CORS
2. Fetches and parses the ICA website HTML
3. Identifies product containers and cards
4. Extracts product information
5. Stores products in Supabase database
6. Returns results or error messages

### 2. DOM Utilities (`dom-utils.ts`)

Provides utilities for HTML processing:

- `fetchAndParse`: Fetches the HTML content and parses it into a DOM document
- `findOfferContainers`: Locates possible containers of product offers
- `findAllOfferCards`: Identifies individual product cards using multiple selector strategies

### 3. Product Extraction (`products-extractor.ts`)

Coordinates the extraction of product data:

- `extractProducts`: Processes all product cards and returns structured product data
- Handles duplicates and logs processing statistics

### 4. Product Processing (`processors/card-processor.ts`)

Processes individual product cards:

- `processProductCard`: Extracts all required information from a single product card
- Integrates the various extractors (name, description, price, image)
- Handles errors at the individual card level

### 5. Data Extractors (in `extractors/` directory)

Specialized modules for extracting specific product information:

- `name-extractor.ts`: Extracts product names using multiple selector strategies
- `description-extractor.ts`: Extracts product descriptions
- `price-extractor.ts`: Extracts and normalizes product prices
- `image-extractor.ts`: Extracts product image URLs

### 6. Supabase Interface (`supabase-client.ts`)

Manages database operations:

- `createSupabaseClient`: Creates and configures the Supabase client
- `storeProducts`: Clears existing products and inserts new ones

## Error Handling

The scraper includes robust error handling:

- Each product card is processed independently to prevent a single failure from affecting others
- Multiple selector strategies are used to adapt to HTML structure changes
- Comprehensive logging helps diagnose issues
- Descriptive error messages are provided for troubleshooting

## Environment Variables

The function requires the following environment variables:

- `SUPABASE_URL`: URL of your Supabase project
- `SUPABASE_ANON_KEY`: Anonymous key for your Supabase project

## Testing

Unit tests are available for each major component:

- Run tests with `deno task test`
- Test files validate each extractor, processor, and utility function

## Usage

The edge function can be invoked with:

```javascript
const { data, error } = await supabase.functions.invoke('scrape-ica');
```

The response includes:

- `success`: Boolean indicating if the operation was successful
- `message`: Details about the operation
- `products`: Array of products that were scraped
