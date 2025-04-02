/**
 * Extracts offer details from a card element
 */
export function extractOfferDetails(card: Element): string | null {
  // Try various selectors for offer details
  const offerSelectors = [
    '.offer-badge', '.discount-badge', '.discount-label',
    '.promo-badge', '.campaign-badge', '.offer-tag',
    '[class*="offer"]', '[class*="discount"]', '[class*="promo"]',
    '[data-test="offer-badge"]'
  ];
  
  for (const selector of offerSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  // Look for text with common offer phrases
  const allElements = card.querySelectorAll('*');
  for (const element of allElements) {
    const text = element.textContent?.trim();
    if (text) {
      // Match patterns like "2 för 30 kr", "REA", etc.
      if (/(\d+)\s*för\s*(\d+)/i.test(text) || 
          /REA/i.test(text) || 
          /erbjudande/i.test(text) ||
          /kampanj/i.test(text)) {
        return text;
      }
    }
  }
  
  return null;
}
