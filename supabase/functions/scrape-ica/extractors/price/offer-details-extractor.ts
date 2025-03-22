
/**
 * Finds offer details like "2 för 69 kr" or "Max 1 köp/hushåll"
 */
export function findOfferDetails(card: Element): string | null {
  // Look for offer details
  const offerDetailsSelectors = [
    '.offer-details', '.promotion-details', '.deal-text', '[class*="offer"]',
    '[class*="promotion"]', '.price-deal', '.special-offer', '.offer-terms',
    '.limitation', '.campaign-text', '.banner-text'
  ];
  
  // First look for dedicated offer details elements
  for (const selector of offerDetailsSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      const text = element.textContent.trim();
      if (text.length > 3 && text.length < 50) { // Reasonable length for offer details
        return text;
      }
    }
  }
  
  // If not found yet, look for specific patterns in the text
  return findOfferDetailsFromText(card);
}

/**
 * Finds offer details by scanning text content for common patterns
 */
export function findOfferDetailsFromText(card: Element): string | null {
  const offerPatterns = [
    /(\d+)\s*för\s*(\d+[.,]?\d*)/i,  // "3 för 70"
    /Max\s*(\d+)\s*köp/i,            // "Max 1 köp"
    /(\d+[.,]?\d*)\s*kr\s*\/\s*st/i, // "25 kr/st"
    /köp\s*(\d+)\s*betala\s*för\s*(\d+)/i // "Köp 3 betala för 2"
  ];
  
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  
  for (const text of allText) {
    for (const pattern of offerPatterns) {
      if (pattern.test(text) && text.length < 50) {
        return text;
      }
    }
    
    // Also look for text with specific keywords in price elements
    if ((text.includes('för') || text.includes('Max') || text.includes('per') || 
         text.includes('köp') || text.includes('st')) && text.length < 50) {
      return text;
    }
  }
  
  return null;
}
