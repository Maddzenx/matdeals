
/**
 * Extracts product name from a card element
 */
export function extractName(card: Element): string | null {
  // Try various selectors for product name
  const nameSelectors = [
    '.product-name', 
    '.product-title',
    '.title',
    '[class*="product-name"]',
    '[class*="product-title"]',
    'h2', 
    'h3',
    '[data-test="product-name"]'
  ];
  
  for (const selector of nameSelectors) {
    const nameElement = card.querySelector(selector);
    if (nameElement && nameElement.textContent) {
      return nameElement.textContent.trim();
    }
  }
  
  // Fallback to any heading
  const heading = card.querySelector('h1, h2, h3, h4, h5');
  if (heading && heading.textContent) {
    return heading.textContent.trim();
  }
  
  return null;
}
