# Willys Johanneberg Product Scraper

This script scrapes product data from Willys Johanneberg's page on matpriskollen.se and updates the Supabase database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and service key to `.env`

## Usage

Run the script manually:
```bash
node scrape-willys.js
```

## Scheduling

To run the script automatically every Monday at 5 AM, add this to your crontab:
```bash
0 5 * * 1 cd /path/to/scripts && node scrape-willys.js >> /path/to/logs/willys-scraper.log 2>&1
```

## Notes

- The script uses Puppeteer for web scraping
- It will delete all existing products before inserting new ones
- Make sure to use a service key with appropriate permissions in Supabase
- The script includes error handling and logging 