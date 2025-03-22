
/**
 * Specialized extractor for product prices
 */
export function extractPrice(container: Element): number | null {
  const priceSelectors = ['.price', '[class*="price"]', '.product-price', '.offer-price', 
                        '[class*="Price"]', '[class*="pris"]', 'strong'];
  let priceText = '';
  
  // First try with specific selectors
  for (const selector of priceSelectors) {
    const priceElement = container.querySelector(selector);
    if (priceElement) {
      priceText = priceElement.textContent?.trim() || '';
      break;
    }
  }
  
  // If no price found with selectors, look for text that matches price pattern
  if (!priceText) {
    const allText = container.textContent || '';
    const priceMatch = allText.match(/(\d+)[,.:]?(\d*)\s*kr/i);
    if (priceMatch) {
      priceText = priceMatch[0];
    }
  }
  
  // Extract numeric price value
  if (priceText) {
    const priceMatch = priceText.match(/(\d+)[,.:]?(\d*)/);
    
    if (priceMatch) {
      const wholePart = parseInt(priceMatch[1]);
      
      // If we have decimal part
      if (priceMatch[2] && priceMatch[2].length > 0) {
        const decimalPart = parseInt(priceMatch[2]);
        return decimalPart > 0 ? parseFloat(`${wholePart}.${decimalPart}`) : wholePart;
      } else {
        return wholePart;
      }
    }
  }
  
  return null;
}
