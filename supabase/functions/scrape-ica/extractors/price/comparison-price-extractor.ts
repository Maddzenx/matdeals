
/**
 * Finds the comparison price (jmfpris) of a product
 */
export function findComparisonPrice(card: Element): string | null {
  // Look for comparison price (jmfpris)
  const comparisonPriceSelectors = [
    '.comparison-price', '.unit-price', '.price-per-unit', '[class*="comparison"]',
    '[class*="jmfpris"]', '.price-comparison', '.per-unit-price', '.price-per',
    '.price-per-kg', '.price-per-unit'
  ];
  
  for (const selector of comparisonPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  // If not found yet, look for text with "Jmfpris" or similar patterns
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .filter(text => 
      text.includes('Jmfpris') || 
      text.match(/\d+[.,]\d+\s*kr\s*\/\s*kg/) ||
      text.match(/\d+[.,]\d+\s*kr\s*\/\s*liter/) ||
      text.match(/\d+[.,]\d+\s*\/\s*\w+/)
    );
    
  if (allText.length > 0) {
    return allText[0];
  }
  
  return null;
}
