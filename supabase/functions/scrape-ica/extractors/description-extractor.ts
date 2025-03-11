
/**
 * Extracts product description from a card element
 */
export function extractProductDescription(card: Element, productName: string | null): string | null {
  const descSelectors = [
    'p.offer-card__text', '.offer-card-v3__description', '.product-card__product-subtitle',
    '.promotion-item__description', '.details', '.description', '[class*="description"]', 
    '[class*="subtitle"]', '[class*="text"]', '.offer-card__preamble',
    '.product__description', '.item__description', '.product-details', '.product-info'
  ];
  
  // Try each selector
  for (const selector of descSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // If no description found yet, look for secondary text elements
  if (productName) {
    const allParagraphs = card.querySelectorAll('p, div.text, span.text');
    for (const para of allParagraphs) {
      const text = para.textContent.trim();
      if (text && text !== productName && text.length > 5) {
        return text;
      }
    }
  }
  
  return null;
}
