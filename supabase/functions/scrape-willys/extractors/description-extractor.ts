
/**
 * Extracts product description from a card element
 */
export function extractProductDescription(card: Element): string {
  // Try various selectors for product description
  const descSelectors = [
    '.product-description',
    '.description',
    '[class*="description"]',
    '[class*="product-desc"]',
    '[data-test="product-description"]',
    '.subtitle'
  ];
  
  for (const selector of descSelectors) {
    const descElement = card.querySelector(selector);
    if (descElement && descElement.textContent) {
      return descElement.textContent.trim();
    }
  }
  
  return "Ingen beskrivning tillgänglig";
}
