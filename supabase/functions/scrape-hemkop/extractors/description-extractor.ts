
/**
 * Specialized extractor for product descriptions
 */
export function extractDescription(container: Element): string | null {
  const descSelectors = ['.description', '[class*="desc"]', '.product-description', 
                       '.subtitle', '.info', '.details', '.product-info', '.meta'];
  
  for (const selector of descSelectors) {
    const descElement = container.querySelector(selector);
    if (descElement) {
      const description = descElement.textContent?.trim() || null;
      if (description) return description;
    }
  }
  
  return null;
}
