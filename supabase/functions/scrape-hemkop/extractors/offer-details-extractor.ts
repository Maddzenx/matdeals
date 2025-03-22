
/**
 * Specialized extractor for product offer details
 */
export function extractOfferDetails(container: Element): string {
  const offerSelectors = ['.offer-badge', '.discount', '.promo', '[class*="badge"]', 
                         '.campaign-text', '.save-text', '.price-tag'];
  const defaultOffer = 'Erbjudande';
  
  for (const selector of offerSelectors) {
    const offerElement = container.querySelector(selector);
    if (offerElement) {
      const offerText = offerElement.textContent?.trim();
      if (offerText && offerText.length > 0) {
        return offerText;
      }
    }
  }
  
  return defaultOffer;
}
