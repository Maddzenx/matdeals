
/**
 * Specialized extractor for product names
 */
export function extractName(container: Element): string | null {
  // Try multiple selectors for product name
  const nameSelectors = ['h2', 'h3', 'h4', '.title', '[class*="title"]', '[class*="name"]', 
                        '.product-title', '.offer-title', '.product-name', '.item-name'];
  
  // Try each selector to find a valid name
  for (const selector of nameSelectors) {
    const nameElement = container.querySelector(selector);
    if (nameElement && nameElement.textContent) {
      const name = nameElement.textContent.trim();
      if (name.length > 2) return name;
    }
  }
  
  // If no name found with selectors, try to find any text that looks like a product name
  const textNodes = Array.from(container.querySelectorAll('*'))
    .filter(el => el.textContent && 
                el.textContent.trim().length > 3 && 
                !el.textContent.match(/\d+[,.:]?\d*\s*kr/));
  
  if (textNodes.length > 0) {
    return textNodes[0].textContent?.trim() || null;
  }
  
  return null;
}
