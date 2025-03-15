
# Recipe Scraper Function

This Edge Function scrapes recipe data from godare.se and stores it in the Supabase database.

## Features

- Scrapes multiple recipe categories
- Extracts comprehensive recipe data including:
  - Title and description
  - Images
  - Preparation time
  - Servings
  - Ingredients
  - Instructions
  - Tags based on content analysis
  - Dynamically generated pricing

## Configuration

The function requires the following environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

These are automatically provided by Supabase Edge Functions.

## Invocation

You can invoke this function via fetch:

```javascript
const response = await fetch(
  'https://your-project-ref.supabase.co/functions/v1/scrape-recipes',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
```

## Response Format

Success response:
```json
{
  "success": true,
  "message": "Successfully scraped and stored X recipes from godare.se",
  "recipesCount": 25
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Error stack trace"
}
```

## Limitations

- The function is optimized for godare.se's current layout (as of 2023)
- If the website structure changes, the scraping logic may need to be updated
- To avoid excessive resource usage, the function limits to 8 recipes per category
