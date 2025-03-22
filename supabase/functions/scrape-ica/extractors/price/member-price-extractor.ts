
/**
 * Checks if the price is a member-only price
 */
export function checkForMemberPrice(card: Element): boolean {
  // Check for "Stämmispris" or member-only indicators
  const memberPriceIndicators = [
    '.member-price', '.stammis-price', '.loyalty-price', '[class*="member"]', 
    '[class*="stammis"]', '[class*="loyalty"]', '.member-offer', '.stammis-offer'
  ];
  
  for (const selector of memberPriceIndicators) {
    if (card.querySelector(selector)) {
      return true;
    }
  }
  
  // If not found by selector, check any text mentioning "Stammis" or members
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  
  for (const text of allText) {
    if (text.toLowerCase().includes('stammis') || 
        text.toLowerCase().includes('medlems') ||
        text.toLowerCase().includes('för medlemmar') ||
        text.toLowerCase().includes('för dig som är medlem')) {
      return true;
    }
  }
  
  return false;
}
