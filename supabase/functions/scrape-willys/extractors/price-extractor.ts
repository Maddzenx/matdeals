
/**
 * Extracts product price from a card element
 */
export function extractProductPrice(card: Element): { price: number | null; originalPrice: number | null } {
  // Try various selectors for prices
  const priceSelectors = [
    '.price', 
    '.current-price',
    '[class*="price"]',
    '[data-test="price"]',
    '.offer-price'
  ];
  
  let priceText = null;
  
  for (const selector of priceSelectors) {
    const priceElement = card.querySelector(selector);
    if (priceElement && priceElement.textContent) {
      priceText = priceElement.textContent.trim();
      break;
    }
  }
  
  let price = null;
  if (priceText) {
    // Extract numeric price from text (e.g., "29:90 kr" -> 29.90)
    const priceMatch = priceText.match(/(\d+)[,\.:]*(\d*)/);
    if (priceMatch) {
      const whole = parseInt(priceMatch[1]);
      const decimal = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
      price = whole + (decimal / 100);
    }
  }
  
  // Look for original price
  const originalPriceSelectors = [
    '.original-price',
    '.old-price',
    '[class*="original-price"]',
    '[class*="old-price"]',
    '[data-test="original-price"]'
  ];
  
  let originalPriceText = null;
  
  for (const selector of originalPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      originalPriceText = element.textContent.trim();
      break;
    }
  }
  
  let originalPrice = null;
  if (originalPriceText) {
    const priceMatch = originalPriceText.match(/(\d+)[,\.:]*(\d*)/);
    if (priceMatch) {
      const whole = parseInt(priceMatch[1]);
      const decimal = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
      originalPrice = whole + (decimal / 100);
    }
  }
  
  return { price, originalPrice };
}
