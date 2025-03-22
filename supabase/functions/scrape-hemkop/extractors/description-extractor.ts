
/**
 * Specialized extractor for product descriptions
 */
export function extractDescription(container: Element): string | null {
  console.log("Extracting description from container:", container.className || container.tagName);
  
  const descSelectors = [
    '.description', '[class*="desc"]', '[class*="Desc"]',
    '.product-description', '.subtitle', '.info', '.details', 
    '.product-info', '.meta', '.ingress', '.summary',
    '[class*="info"]', '[class*="Info"]', '[class*="details"]',
    '.comparison-price', '.jmfpris', '.unit-price'
  ];
  
  // First try with specific selectors
  for (const selector of descSelectors) {
    const descElement = container.querySelector(selector);
    if (descElement) {
      const description = descElement.textContent?.trim() || null;
      if (description && description.length > 0) {
        console.log(`Found description with selector ${selector}: "${description}"`);
        return description;
      }
    }
  }
  
  // Try to find a paragraph or div that might contain a description
  const potentialDescElements = Array.from(container.querySelectorAll('p, div, span'))
    .filter(el => {
      const text = el.textContent?.trim();
      // Look for elements with reasonable description length text
      // that don't contain price patterns or typical non-description content
      return text && 
             text.length > 10 && 
             text.length < 250 &&
             !text.match(/^\d+[,.:]?\d*\s*kr/) &&
             !text.match(/^(per|st|kg|l)$/i) &&
             !el.querySelector('img') && // Descriptions typically don't have images
             el.children.length < 3;     // Descriptions are usually simple text
    })
    .sort((a, b) => {
      // Sort by text length - descriptions are usually longer than other texts
      return (b.textContent?.length || 0) - (a.textContent?.length || 0);
    });
  
  if (potentialDescElements.length > 0) {
    const description = potentialDescElements[0].textContent?.trim() || null;
    if (description) {
      console.log(`Found description from element: "${description}"`);
      return description;
    }
  }
  
  // If we still don't have a description, look for any jämförpris (price comparison) text
  const allText = container.textContent || '';
  const comparisonPriceMatch = allText.match(/jämförpris:?\s+([\d,.]+)\s*kr\/([a-zA-Z]+)/i);
  
  if (comparisonPriceMatch) {
    const comparisonPrice = `Jämförpris: ${comparisonPriceMatch[1]} kr/${comparisonPriceMatch[2]}`;
    console.log(`Extracted comparison price as description: "${comparisonPrice}"`);
    return comparisonPrice;
  }
  
  console.log("Could not extract description from container");
  return null;
}
