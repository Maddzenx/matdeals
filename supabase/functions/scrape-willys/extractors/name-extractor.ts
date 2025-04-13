
/**
 * Extract the name of a product from a product element
 * @param element The product element
 * @returns The product name
 */
export default function extractName(element: Element): string {
  try {
    // Look for standard title elements
    const titleEl = element.querySelector('h2, h3, h4, [class*="title"], [class*="name"], .product-name');
    
    if (titleEl && titleEl.textContent) {
      return titleEl.textContent.trim();
    }
    
    // Try generic selectors with name or title classes
    const nameEl = element.querySelector('[class*="name"], [class*="title"]');
    if (nameEl && nameEl.textContent) {
      return nameEl.textContent.trim();
    }
    
    // Try finding by text content pattern
    const paragraphs = Array.from(element.querySelectorAll('p, span, div'));
    for (const p of paragraphs) {
      if (p.textContent && 
          !p.textContent.includes('kr') && 
          !p.textContent.includes(':-') && 
          p.textContent.length > 5 && 
          p.textContent.length < 100) {
        return p.textContent.trim();
      }
    }
    
    // Last resort: any text content in the element
    if (element.textContent) {
      const text = element.textContent.trim();
      const firstSentence = text.split(/[.!?]/)[0].trim();
      
      if (firstSentence.length > 3 && firstSentence.length < 100) {
        return firstSentence;
      }
    }
    
    return "Unknown Product";
    
  } catch (error) {
    console.error("Error extracting product name:", error);
    return "Error: Could not extract product name";
  }
}

// Also export the renamed function for backwards compatibility
export const extractProductName = extractName;

// Export as named export for direct imports
export { extractName };
