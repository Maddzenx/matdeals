
/**
 * Utility for extracting product names from HTML elements
 */

/**
 * Extracts the product name from an HTML element
 */
export function extractProductName(element: Element): string | null {
  try {
    // Find elements with name-related classes
    const nameElement = 
      element.querySelector('.product-name, .product-title, .offer-title, h3, [class*="name"], [class*="title"]') || 
      element.querySelector('h1, h2, h3, h4, h5');
      
    if (nameElement && nameElement.textContent) {
      return nameElement.textContent.trim();
    }
    
    // If no specific name element found, try to get the most likely text
    const headingElements = element.querySelectorAll('h1, h2, h3, h4, h5, strong, b');
    for (let i = 0; i < headingElements.length; i++) {
      const heading = headingElements[i];
      if (heading && heading.textContent && heading.textContent.trim().length > 2) {
        return heading.textContent.trim();
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting product name:", error);
    return null;
  }
}

// Default export for compatibility
export default extractProductName;
