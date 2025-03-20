
// URLs to attempt to scrape from
export const HEMKOP_URLS = [
  "https://www.hemkop.se/erbjudanden",
  "https://www.hemkop.se/erbjudanden/veckans-erbjudanden",
  "https://www.hemkop.se/erbjudanden/veckans-erbjudanden/nordstan", // Specifically targeting Nordstan store
  "https://www.hemkop.se/butik/nordstan", // Alternative Nordstan page
  "https://www.hemkop.se/butiker/nordstan" // Another potential Nordstan URL
];

// Base URL for resolving relative URLs
export const BASE_URL = "https://www.hemkop.se";

// User agents to rotate between for avoiding bot detection
export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
];
