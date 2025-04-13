
/**
 * Extract the price of a product from a product element
 * @param element The product element
 * @returns The product price as a number
 */
export default function extractPrice(element: Element): number {
  try {
    // Try different approaches to find price
    
    // 1. Look for standard price elements
    const priceEl = element.querySelector('[class*="price"], [class*="pris"], .product-price');
    
    if (priceEl && priceEl.textContent) {
      const priceText = priceEl.textContent.trim();
      return parsePriceText(priceText);
    }
    
    // 2. Look for spans containing price format
    const spans = Array.from(element.querySelectorAll('span, div, p'));
    
    for (const span of spans) {
      if (span.textContent && 
          (span.textContent.includes('kr') || 
           span.textContent.includes(':-') || 
           span.textContent.match(/\d+[,.]\d{2}/))) {
        return parsePriceText(span.textContent);
      }
    }
    
    // 3. Look in the element's text content
    if (element.textContent) {
      return parsePriceText(element.textContent);
    }
    
    return 0;
    
  } catch (error) {
    console.error("Error extracting product price:", error);
    return 0;
  }
}

/**
 * Parse price text to number
 * @param text Price text to parse
 * @returns Parsed price number
 */
function parsePriceText(text: string): number {
  try {
    // Extract digits and decimals
    const matches = text.match(/(\d+)[,.]?(\d{0,2})/);
    
    if (matches) {
      const wholePart = parseInt(matches[1]);
      
      if (matches[2]) {
        const fractionPart = parseInt(matches[2]);
        return parseFloat(`${wholePart}.${fractionPart}`);
      }
      
      return wholePart;
    }
    
    // For special offers like "3 för 25", return the total price
    const specialOfferMatch = text.match(/(\d+)\s*för\s*(\d+)/i);
    if (specialOfferMatch) {
      return parseInt(specialOfferMatch[2]);
    }
    
    return 0;
    
  } catch (error) {
    console.error("Error parsing price text:", error);
    return 0;
  }
}

// Also export the renamed function for backwards compatibility  
export const extractProductPrice = extractPrice;

// Export as named export for direct imports
export { extractPrice };
