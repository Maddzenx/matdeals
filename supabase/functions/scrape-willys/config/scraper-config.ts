
// Willys URLs to try for scraping - prioritizing Johanneberg store
export const WILLYS_URLS = [
  'https://www.willys.se/erbjudanden/butik/willys-johanneberg',  // Primary target: Johanneberg store offers page
  'https://www.willys.se/butik/willys-johanneberg-goteborg',     // Specific Johanneberg store page
  'https://www.willys.se/erbjudanden/butik',                     // Fallback to general store offers
  'https://www.willys.se/erbjudanden/veckans-erbjudanden',
  'https://www.willys.se/erbjudanden',
  'https://www.willys.se/sok?q=erbjudande',
  'https://www.willys.se'
];

// User agent strings to try
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/118.0.5993.69 Mobile/15E148 Safari/604.1'
];

export const BASE_URL = "https://www.willys.se";
export const STORE_NAME = "Willys Johanneberg"; // Add store name for labeling products
