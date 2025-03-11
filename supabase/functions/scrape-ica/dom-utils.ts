
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Fetches and parses HTML content from a given URL
 */
export async function fetchAndParse(url: string): Promise<Document> {
  console.log("Fetching ICA website data from:", url);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch with status: ${response.status}`);
  }
  
  const html = await response.text();
  
  // Parse the HTML
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  
  if (!document) {
    throw new Error("Failed to parse HTML document");
  }
  
  return document;
}

/**
 * Finds all possible offer containers from the document
 */
export function findOfferContainers(document: Document): Element[] {
  const offerContainers = [
    ...document.querySelectorAll('.view--promotion-list'),
    ...document.querySelectorAll('.sv-row-promotional__offers'),
    ...document.querySelectorAll('.sv-text-promotional__block'),
    ...document.querySelectorAll('.promotion__list'),
    ...document.querySelectorAll('.product-list'),
    ...document.querySelectorAll('.offer-list'),
    ...document.querySelectorAll('[class*="promotional"]'),
    ...document.querySelectorAll('[class*="promotion"]'),
    ...document.querySelectorAll('[class*="offer"]'),
    ...document.querySelectorAll('.price-table'),
    ...document.querySelectorAll('.offer-grid'),
    ...document.querySelectorAll('.product-grid'),
    ...document.querySelectorAll('.deal-section')
  ];
  
  console.log(`Found ${offerContainers.length} offer containers to process`);
  return offerContainers;
}

/**
 * Finds all offer cards using multiple selector strategies
 */
export function findAllOfferCards(document: Document, offerContainers: Element[]): Element[] {
  // Direct card selection
  let offerCards = [
    ...document.querySelectorAll('article.offer-card'),
    ...document.querySelectorAll('.offer-card-v3'),
    ...document.querySelectorAll('.offer-card-banner'),
    ...document.querySelectorAll('.product-card'),
    ...document.querySelectorAll('.offer-card__container'),
    ...document.querySelectorAll('.promotion-item'),
    ...document.querySelectorAll('.offer-list__item'),
    ...document.querySelectorAll('article[class*="offer"]'),
    ...document.querySelectorAll('article[class*="product"]'),
    ...document.querySelectorAll('div[class*="offer-card"]'),
    ...document.querySelectorAll('div[class*="product-card"]'),
    ...document.querySelectorAll('.price-item'),
    ...document.querySelectorAll('.deal-item'),
    ...document.querySelectorAll('.offer__item')
  ];
  
  // If no cards found directly, try to find them within the containers
  if (offerCards.length === 0 && offerContainers.length > 0) {
    for (const container of offerContainers) {
      offerCards = [
        ...offerCards,
        ...container.querySelectorAll('article'),
        ...container.querySelectorAll('.offer-card'),
        ...container.querySelectorAll('.product-card'),
        ...container.querySelectorAll('.offer-card-v3'),
        ...container.querySelectorAll('.promotion-item'),
        ...container.querySelectorAll('div[class*="offer"]'),
        ...container.querySelectorAll('div[class*="product"]'),
        ...container.querySelectorAll('[class*="item"]'),
        ...container.querySelectorAll('.price-item'),
        ...container.querySelectorAll('.deal-item'),
        ...container.querySelectorAll('li'), // Some offers might be in list items
        ...container.querySelectorAll('.product-tile')
      ];
    }
  }
  
  console.log(`Found ${offerCards.length} offer elements to process`);

  // If still no offers found, try a more general approach
  if (offerCards.length === 0) {
    // Look for any elements that might contain offer information
    const possibleOfferElements = document.querySelectorAll('article, .card, [class*="offer"], [class*="product"], [class*="promotion"], [class*="item"], [class*="price-"], [class*="deal-"]');
    console.log(`Trying broader selector, found ${possibleOfferElements.length} possible elements`);
    offerCards = [...possibleOfferElements];
  }
  
  // As a fallback, look for specific sections that might contain products
  if (offerCards.length < 20) {  // If we still don't have enough products
    console.log("Not enough products found, trying to find sections with products");
    
    // Get all sections or divs that might be product containers
    const sections = document.querySelectorAll('section, div.container, div.content, main > div');
    
    for (const section of sections) {
      // Look for headers or titles that suggest this section contains offers
      const headers = section.querySelectorAll('h1, h2, h3, h4, .title, .heading');
      
      for (const header of headers) {
        const headerText = header.textContent.toLowerCase();
        
        // If the header suggests product offers
        if (headerText.includes('erbjudanden') || headerText.includes('offer') || 
            headerText.includes('produkt') || headerText.includes('product') || 
            headerText.includes('pris') || headerText.includes('price') ||
            headerText.includes('kampanj') || headerText.includes('deal')) {
          
          console.log(`Found potential product section with header: ${headerText}`);
          
          // Get all divs or articles that might be products in this section
          const potentialProducts = section.querySelectorAll('div > article, div > div > article, div[class*="item"], div[class*="card"], li, .product-row, .price-row');
          
          if (potentialProducts.length > 0) {
            console.log(`Found ${potentialProducts.length} potential products in section`);
            offerCards = [...offerCards, ...potentialProducts];
          }
        }
      }
    }
  }
  
  console.log(`Total potential product elements to process: ${offerCards.length}`);
  return offerCards;
}
