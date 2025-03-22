
/**
 * Specialized extractor for product names
 */
export function extractName(container: Element): string | null {
  console.log("Extracting name from container:", container.className || container.tagName);
  
  // Try multiple selectors for product name with specificity order
  const nameSelectors = [
    'h1', 'h2', 'h3', 'h4', 
    '.title', '[class*="title"]', '[class*="Title"]',
    '[class*="name"]', '[class*="Name"]',
    '.product-title', '.offer-title', '.product-name', '.item-name',
    'b', 'strong', '.headline', '[class*="heading"]'
  ];
  
  // Try each selector to find a valid name
  for (const selector of nameSelectors) {
    const nameElement = container.querySelector(selector);
    if (nameElement && nameElement.textContent) {
      const name = nameElement.textContent.trim();
      if (name.length > 2) {
        console.log(`Found name with selector ${selector}: "${name}"`);
        return name;
      }
    }
  }
  
  // If no name found with selectors, try to find any text that looks like a product name
  const textNodes = Array.from(container.querySelectorAll('*'))
    .filter(el => {
      const text = el.textContent?.trim();
      // Exclude elements with very short text or obvious price text
      return text && 
             text.length > 5 && 
             text.length < 100 &&
             !text.match(/^\d+[,.:]?\d*\s*kr/) &&
             !text.match(/^(per|st|kg|l)$/i);
    })
    .sort((a, b) => {
      // Sort by text length - often product names are longer than other text
      return (b.textContent?.length || 0) - (a.textContent?.length || 0);
    });
  
  if (textNodes.length > 0) {
    const name = textNodes[0].textContent?.trim() || null;
    if (name) {
      console.log(`Found name from text node: "${name}"`);
      return name;
    }
  }
  
  // As a last resort, use any meaningful text from the container
  const containerText = container.textContent?.trim();
  if (containerText && containerText.length > 5 && containerText.length < 100) {
    // Try to extract a reasonable name from the container text
    // First remove any price-like patterns
    const cleanedText = containerText.replace(/\d+[,.:]?\d*\s*kr/g, '').trim();
    if (cleanedText.length > 3) {
      console.log(`Extracted name from container text: "${cleanedText}"`);
      return cleanedText;
    }
  }
  
  console.log("Could not extract name from container");
  return null;
}
