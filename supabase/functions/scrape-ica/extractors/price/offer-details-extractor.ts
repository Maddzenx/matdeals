
/**
 * Finds offer details like "2 för 69 kr" or "Max 1 köp/hushåll"
 */

// Selectors used for finding offer details elements
const OFFER_DETAILS_SELECTORS = [
  '.offer-details', '.promotion-details', '.deal-text', '[class*="offer"]',
  '[class*="promotion"]', '.price-deal', '.special-offer', '.offer-terms',
  '.limitation', '.campaign-text', '.banner-text'
];

// Common patterns for offer details
const OFFER_PATTERNS = [
  /(\d+)\s*för\s*(\d+[.,]?\d*)/i,  // "3 för 70"
  /Max\s*(\d+)\s*köp/i,            // "Max 1 köp"
  /(\d+[.,]?\d*)\s*kr\s*\/\s*st/i, // "25 kr/st"
  /köp\s*(\d+)\s*betala\s*för\s*(\d+)/i // "Köp 3 betala för 2"
];

// Keywords commonly found in offer details
const OFFER_KEYWORDS = ['för', 'Max', 'per', 'köp', 'st'];

/**
 * Finds an offer details element in the product card
 */
function findOfferDetailsElement(card: Element): string | null {
  for (const selector of OFFER_DETAILS_SELECTORS) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      const text = element.textContent.trim();
      if (isValidOfferText(text)) {
        return text;
      }
    }
  }
  return null;
}

/**
 * Checks if the offer text is valid (reasonable length)
 */
function isValidOfferText(text: string): boolean {
  return text.length > 3 && text.length < 50;
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
 * Checks if text matches an offer pattern
 */
function matchesOfferPattern(text: string): boolean {
  // Check against specific regex patterns
  for (const pattern of OFFER_PATTERNS) {
    if (pattern.test(text) && text.length < 50) {
      return true;
    }
  }
  
  // Check for keywords
  if (containsOfferKeyword(text) && text.length < 50) {
    return true;
  }
  
  return false;
}

/**
 * Checks if text contains any offer keywords
 */
function containsOfferKeyword(text: string): boolean {
  return OFFER_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Searches for text matching offer patterns
 */
function findOfferPatternFromText(card: Element): string | null {
  const allText = getAllTextContent(card);
  
  for (const text of allText) {
    if (matchesOfferPattern(text)) {
      return text;
    }
  }
  
  return null;
}

/**
 * Finds offer details like "2 för 69 kr" or "Max 1 köp/hushåll"
 */
export function findOfferDetails(card: Element): string | null {
  // First try to find dedicated offer details elements
  const elementText = findOfferDetailsElement(card);
  if (elementText) {
    return elementText;
  }
  
  // If not found yet, look for specific patterns in the text
  return findOfferPatternFromText(card);
}

/**
 * Finds offer details by scanning text content for common patterns
 */
export function findOfferDetailsFromText(card: Element): string | null {
  return findOfferPatternFromText(card);
}
