
/**
 * Utility for extracting price information from HTML elements
 */

/**
 * Extracts price information from an HTML element
 */
export function extractProductPrice(element: Element): any {
  try {
    // Find elements with price-related classes
    const priceElement = 
      element.querySelector('.price, [class*="price"], .offer-price, [class*="offer"]') ||
      element.querySelector('span, div, p');
      
    if (priceElement && priceElement.textContent) {
      const text = priceElement.textContent.trim();
      
      // Look for price patterns (e.g., '25:- kr', '25,90 kr', etc.)
      const priceMatches = text.match(/(\d+[.,]?\d*)(?:\s*(?::-|kr|SEK))/i);
      
      if (priceMatches && priceMatches[1]) {
        return {
          price: priceMatches[1],
          priceText: text
        };
      }
    }
    
    // If no specific pattern found, look for any price-like text
    const allText = element.textContent || '';
    const priceMatches = allText.match(/(\d+[.,]?\d*)(?:\s*(?::-|kr|SEK))/i);
    
    if (priceMatches && priceMatches[1]) {
      return {
        price: priceMatches[1],
        priceText: priceMatches[0]
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting product price:", error);
    return null;
  }
}

// Default export for compatibility
export default extractProductPrice;
