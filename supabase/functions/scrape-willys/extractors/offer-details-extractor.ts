
/**
 * Extracts offer details from a card element
 */
export function extractOfferDetails(card: Element): string {
  // Try various selectors for offer details
  const offerSelectors = [
    '.offer-badge',
    '.discount',
    '.promo',
    '[class*="offer"]',
    '[class*="discount"]',
    '[class*="promo"]',
    '[data-test="offer-badge"]'
  ];
  
  for (const selector of offerSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  return "Erbjudande";
}
