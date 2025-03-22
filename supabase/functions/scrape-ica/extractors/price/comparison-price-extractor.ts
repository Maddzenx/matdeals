
/**
 * Finds the comparison price (jmfpris) of a product
 */

// Selectors used for finding comparison price elements
const COMPARISON_PRICE_SELECTORS = [
  '.comparison-price', '.unit-price', '.price-per-unit', '[class*="comparison"]',
  '[class*="jmfpris"]', '.price-comparison', '.per-unit-price', '.price-per',
  '.price-per-kg', '.price-per-unit'
];

// Text patterns for comparison price
const COMPARISON_PRICE_PATTERNS = [
  /Jmfpris/i,
  /\d+[.,]\d+\s*kr\s*\/\s*kg/,
  /\d+[.,]\d+\s*kr\s*\/\s*liter/,
  /\d+[.,]\d+\s*\/\s*\w+/
];

/**
 * Finds a comparison price element in the product card
 */
function findComparisonPriceElement(card: Element): Element | null {
  for (const selector of COMPARISON_PRICE_SELECTORS) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element;
    }
  }
  return null;
}

/**
 * Searches for text containing comparison price information
 */
function findComparisonPriceFromText(card: Element): string | null {
  const allText = getAllTextContent(card);
  
  for (const text of allText) {
    if (matchesComparisonPricePattern(text)) {
      return text;
    }
  }
  
  return null;
}

/**
 * Checks if text matches any comparison price pattern
 */
function matchesComparisonPricePattern(text: string): boolean {
  return COMPARISON_PRICE_PATTERNS.some(pattern => pattern.test(text));
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
 * Finds the comparison price (jmfpris) of a product
 */
export function findComparisonPrice(card: Element): string | null {
  // First try to find element with comparison price
  const priceElement = findComparisonPriceElement(card);
  if (priceElement) {
    return priceElement.textContent.trim();
  }
  
  // If not found yet, look for text with comparison price patterns
  return findComparisonPriceFromText(card);
}
