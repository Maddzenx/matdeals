
/**
 * Extracts product name from a card element using multiple selectors
 */
export function extractProductName(card: Element): string | null {
  const nameSelectors = [
    'p.offer-card__title', '.offer-card-v3__title', '.product-card__product-name', 
    '.promotion-item__title', 'h2', 'h3', '.title', '[class*="title"]',
    '[class*="name"]', '.offer-card__heading', '.product__title', '.item__title',
    'p.title', 'p.heading', 'div.title', 'div.heading', 'span.title', 'span.heading'
  ];
  
  // Try each selector
  for (const selector of nameSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // If still no name, try to find any text that might be a product name
  const possibleNameElements = card.querySelectorAll('p, h1, h2, h3, h4, .text-title, [class*="title"], [class*="name"], strong, b');
  for (const element of possibleNameElements) {
    const text = element.textContent.trim();
    if (text && text.length > 3 && text.length < 100) {
      return text;
    }
  }
  
  // Last resort: use any prominent text in the card as a potential name
  const allTextElements = card.querySelectorAll('*');
  for (const element of allTextElements) {
    if (element.children.length === 0 && element.textContent) {
      const text = element.textContent.trim();
      if (text && text.length > 3 && text.length < 100) {
        return text;
      }
    }
  }
  
  return null;
}
