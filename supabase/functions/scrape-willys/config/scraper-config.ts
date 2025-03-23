
// URLs to scrape from Willys website
export const WILLYS_URLS = [
  'https://www.willys.se/erbjudanden/butik/johanneberg',   // Specific Johanneberg store
  'https://www.willys.se/erbjudanden/butik',               // Fallback to general offers
];

// User agents to rotate for avoiding bot detection
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
];

// Base URL for resolving relative URLs
export const BASE_URL = 'https://www.willys.se';

// Store name to use for all products
export const STORE_NAME = 'willys johanneberg';
