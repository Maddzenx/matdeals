
/**
 * Extracts product price from a card element
 */
export function extractProductPrice(card: Element): { price: number | null; priceStr: string | null } {
  // Try multiple price element selectors
  const priceSelectors = [
    'div.price-splash__text', '.product-price', '.offer-card-v3__price-value',
    '.price-standard__value', '.price', '[class*="price"]', '.promotion-item__price',
    '.offer-card__price', '.product__price', '.item__price', 
    'span[class*="price"]', 'div[class*="price"]', 'p[class*="price"]'
  ];
  
  for (const selector of priceSelectors) {
    const element = card.querySelector(selector);
    if (element) {
      // Look for specific price value within the price element
      const valueElement = element.querySelector('span.price-splash__text__firstValue') || 
                          element.querySelector('.price-standard__value') ||
                          element;
                          
      if (valueElement) {
        const priceStr = valueElement.textContent.trim();
        // Extract numeric part of the price, removing non-numeric characters except decimal point
        const numericPrice = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
        const price = numericPrice ? parseFloat(numericPrice) : null;
        return { price, priceStr };
      }
    }
  }
  
  // If still no price found, try to find any text that looks like a price
  const allTextNodes: string[] = [];
  const textNodes = card.querySelectorAll('*');
  textNodes.forEach(node => {
    if (node.textContent) {
      allTextNodes.push(node.textContent.trim());
    }
  });
  
  for (const text of allTextNodes) {
    // Look for patterns like "25:-", "25.90:-", "25,90 kr", etc.
    const priceMatches = text.match(/(\d+[.,]?\d*)(?:\s*(?::-|kr|SEK|:-\s*kr))/i);
    if (priceMatches && priceMatches[1]) {
      const price = parseFloat(priceMatches[1].replace(',', '.'));
      return { price, priceStr: text };
    }
  }
  
  return { price: null, priceStr: null };
}
