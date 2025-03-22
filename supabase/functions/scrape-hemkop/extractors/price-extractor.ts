
/**
 * Specialized extractor for product prices
 */
export function extractPrice(container: Element): number | null {
  console.log("Extracting price from container:", container.className || container.tagName);
  
  const priceSelectors = [
    '.price', '[class*="price"]', '[class*="Price"]', 
    '.product-price', '.offer-price', 
    '[class*="pris"]', '[class*="Pris"]',
    'strong', 'b', '.value', '[class*="value"]'
  ];
  
  let priceText = '';
  
  // First try with specific selectors
  for (const selector of priceSelectors) {
    const priceElement = container.querySelector(selector);
    if (priceElement) {
      priceText = priceElement.textContent?.trim() || '';
      if (priceText) {
        console.log(`Found price text with selector ${selector}: "${priceText}"`);
        break;
      }
    }
  }
  
  // If no price found with selectors, look for text that matches price pattern
  if (!priceText) {
    const allText = container.textContent || '';
    
    // Try to find price patterns like "99:-", "99 kr", "99.90", etc.
    const pricePatterns = [
      /(\d+)[,.:]?(\d*)\s*kr/i,   // "99 kr" or "99.90 kr"
      /(\d+)[,.:]?(\d*)\s*:-/,    // "99:-" or "99.90:-"
      /(\d+)[,.:]?(\d*)\s*SEK/i,  // "99 SEK" or "99.90 SEK"
      /pris[:\s]+(\d+)[,.:]?(\d*)/i,  // "pris: 99" or "pris: 99.90"
      /(\d+)[,.:]?(\d*)[^\d\s]+st/i   // "99:-/st" or "99.90/st"
    ];
    
    for (const pattern of pricePatterns) {
      const match = allText.match(pattern);
      if (match) {
        priceText = match[0];
        console.log(`Found price with pattern ${pattern}: "${priceText}"`);
        break;
      }
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
        const price = decimalPart > 0 ? parseFloat(`${wholePart}.${decimalPart}`) : wholePart;
        console.log(`Extracted price: ${price}`);
        return price;
      } else {
        console.log(`Extracted price: ${wholePart}`);
        return wholePart;
      }
    }
  }
  
  console.log("Could not extract price from container");
  return null;
}
