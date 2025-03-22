
/**
 * Finds the original price (before discount) of a product
 */

// Selectors used for finding original price elements
const ORIGINAL_PRICE_SELECTORS = [
  '.original-price', '.regular-price', '.was-price', '[class*="original"]', 
  '[class*="regular"]', '.price-was', '.old-price', '.strikethrough-price',
  '.price-regular', '.price__original', '[data-price-original]', '.pre-price',
  'del', '.price-before', '.full-price'
];

// Text patterns that indicate original price
const ORIGINAL_PRICE_PATTERNS = [
  /Ord\.pris/i,
  /Ordinarie/i,
  /Tidigare/i,
  /\d+[.,]\d+\s*kr\s*\/\s*\d+[.,]\d+\s*kr/
];

/**
 * Finds the original price element within a product card
 */
function findOriginalPriceElement(card: Element): Element | null {
  for (const selector of ORIGINAL_PRICE_SELECTORS) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element;
    }
  }
  return null;
}

/**
 * Searches for text containing original price indicators
 */
function findOriginalPriceFromText(card: Element): string | null {
  const allText = getAllTextContent(card);
  
  for (const text of allText) {
    if (matchesOriginalPricePattern(text)) {
      return text;
    }
  }
  
  return null;
}

/**
 * Checks if text matches any original price pattern
 */
function matchesOriginalPricePattern(text: string): boolean {
  return ORIGINAL_PRICE_PATTERNS.some(pattern => pattern.test(text));
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
 * Finds the original price (before discount) of a product
 */
export function findOriginalPrice(card: Element): string | null {
  // First try to find element with original price
  const priceElement = findOriginalPriceElement(card);
  if (priceElement) {
    return priceElement.textContent.trim();
  }
  
  // If not found, try to match text patterns
  return findOriginalPriceFromText(card);
}
