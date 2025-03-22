
/**
 * Extracts the main price from a product card
 */

// Selectors used for finding price elements
const PRICE_SELECTORS = [
  'div.price-splash__text', '.product-price', '.offer-card-v3__price-value',
  '.price-standard__value', '.price', '[class*="price"]', '.promotion-item__price',
  '.offer-card__price', '.product__price', '.item__price', 
  'span[class*="price"]', 'div[class*="price"]', 'p[class*="price"]',
  '.pricebox', '.price-amount', '.offer-price'
];

/**
 * Finds the main price element within a product card
 */
function findPriceElement(card: Element): Element | null {
  for (const selector of PRICE_SELECTORS) {
    const element = card.querySelector(selector);
    if (element) {
      // Look for specific price value within the price element
      return element.querySelector('span.price-splash__text__firstValue') || 
             element.querySelector('.price-standard__value') ||
             element;
    }
  }
  return null;
}

/**
 * Extracts price from text, converting to proper format
 */
function extractPriceFromText(text: string): number | null {
  // Extract numeric part of the price, removing non-numeric characters except decimal point
  const numericPrice = text.replace(/[^\d,.]/g, '').replace(',', '.');
  return numericPrice ? parseFloat(numericPrice) : null;
}

/**
 * Finds the main price from a product card
 */
export function findMainPrice(card: Element): { price: number | null; priceStr: string | null } {
  let price: number | null = null;
  let priceStr: string | null = null;
  
  // Find main price element
  const priceElement = findPriceElement(card);
  
  if (priceElement) {
    priceStr = priceElement.textContent.trim();
    price = extractPriceFromText(priceStr);
  }
  
  // If still no price found, try to find any text that looks like a price
  if (price === null) {
    const result = findPriceFromAllText(card);
    price = result.price;
    priceStr = result.priceStr;
  }
  
  return { price, priceStr };
}

/**
 * Finds price by scanning all text nodes for price patterns
 */
export function findPriceFromAllText(card: Element): { price: number | null; priceStr: string | null } {
  const allTextNodes = getAllTextContent(card);
  
  for (const text of allTextNodes) {
    const priceInfo = extractPricePattern(text);
    if (priceInfo) {
      return priceInfo;
    }
  }
  
  return { price: null, priceStr: null };
}

/**
 * Gets all text content from elements within a card
 */
function getAllTextContent(card: Element): string[] {
  const allTextNodes: string[] = [];
  const textNodes = card.querySelectorAll('*');
  
  textNodes.forEach(node => {
    if (node.textContent) {
      allTextNodes.push(node.textContent.trim());
    }
  });
  
  return allTextNodes;
}

/**
 * Extracts price from text containing a price pattern
 */
function extractPricePattern(text: string): { price: number, priceStr: string } | null {
  // Look for patterns like "25:-", "25.90:-", "25,90 kr", etc.
  const priceMatches = text.match(/(\d+[.,]?\d*)(?:\s*(?::-|kr|SEK|:-\s*kr))/i);
  
  if (priceMatches && priceMatches[1]) {
    const price = parseFloat(priceMatches[1].replace(',', '.'));
    return { price, priceStr: text };
  }
  
  return null;
}
