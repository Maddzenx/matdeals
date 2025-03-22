
/**
 * Checks if the price is a member-only price
 */

// Selectors for member price elements
const MEMBER_PRICE_SELECTORS = [
  '.member-price', '.stammis-price', '.loyalty-price', '[class*="member"]', 
  '[class*="stammis"]', '[class*="loyalty"]', '.member-offer', '.stammis-offer'
];

// Keywords for member prices in text
const MEMBER_PRICE_KEYWORDS = [
  'stammis',
  'medlems',
  'för medlemmar',
  'för dig som är medlem'
];

/**
 * Checks for member price indicators using CSS selectors
 */
function checkForMemberPriceSelectors(card: Element): boolean {
  for (const selector of MEMBER_PRICE_SELECTORS) {
    if (card.querySelector(selector)) {
      return true;
    }
  }
  return false;
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
 * Checks if any text content contains member price keywords
 */
function checkForMemberPriceText(card: Element): boolean {
  const allText = getAllTextContent(card);
  
  for (const text of allText) {
    const lowerText = text.toLowerCase();
    if (containsMemberKeyword(lowerText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if text contains any member price keyword
 */
function containsMemberKeyword(text: string): boolean {
  return MEMBER_PRICE_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Checks if the price is a member-only price
 */
export function checkForMemberPrice(card: Element): boolean {
  // First check using selectors
  if (checkForMemberPriceSelectors(card)) {
    return true;
  }
  
  // If not found by selector, check any text mentioning members
  return checkForMemberPriceText(card);
}
