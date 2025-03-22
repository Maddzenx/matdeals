
/**
 * Specialized extractor for product offer details
 */
export function extractOfferDetails(container: Element): string {
  console.log("Extracting offer details from container:", container.className || container.tagName);
  
  const offerSelectors = [
    '.offer-badge', '.discount', '.promo', '[class*="badge"]', 
    '.campaign-text', '.save-text', '.price-tag', '.deal',
    '[class*="discount"]', '[class*="Discount"]', '[class*="campaign"]',
    '[class*="Campaign"]', '[class*="offer"]', '[class*="Offer"]',
    '.sale-label', '.price-cut'
  ];
  
  const defaultOffer = 'Veckans erbjudande';
  
  // First try with specific selectors
  for (const selector of offerSelectors) {
    const offerElement = container.querySelector(selector);
    if (offerElement) {
      const offerText = offerElement.textContent?.trim();
      if (offerText && offerText.length > 0) {
        console.log(`Found offer details with selector ${selector}: "${offerText}"`);
        return offerText;
      }
    }
  }
  
  // Look for common offer phrases
  const offerPatterns = [
    /(spara|rabatt|erbjudande|kampanj|rea)[\s:]+([\d]+)[%kr:-]/i,
    /(\d+)[%][\s]+(rabatt)/i,
    /(köp\s+\d+\s+betala\s+för\s+\d+)/i,
    /(\d+)[\s]+för[\s]+([\d]+)[\s]*kr/i,
    /(super|extra|special)[\s]+(pris|erbjudande)/i
  ];
  
  const allText = container.textContent || '';
  
  for (const pattern of offerPatterns) {
    const match = allText.match(pattern);
    if (match) {
      console.log(`Found offer pattern match: "${match[0]}"`);
      return match[0];
    }
  }
  
  // If we found any elements with colors often used for offers (red, orange)
  const colorElements = Array.from(container.querySelectorAll('*'))
    .filter(el => {
      const style = el.getAttribute('style') || '';
      const className = el.className || '';
      return (style.includes('color:') && (style.includes('red') || style.includes('orange'))) ||
             (className.includes('red') || className.includes('orange'));
    });
  
  if (colorElements.length > 0) {
    const offerText = colorElements[0].textContent?.trim();
    if (offerText && offerText.length > 0 && offerText.length < 40) {
      console.log(`Found offer text in colored element: "${offerText}"`);
      return offerText;
    }
  }
  
  console.log(`No specific offer details found, using default: "${defaultOffer}"`);
  return defaultOffer;
}
