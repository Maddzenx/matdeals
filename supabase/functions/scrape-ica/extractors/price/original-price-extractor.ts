
/**
 * Finds the original price (before discount) of a product
 */
export function findOriginalPrice(card: Element): string | null {
  // Look for original price
  const originalPriceSelectors = [
    '.original-price', '.regular-price', '.was-price', '[class*="original"]', 
    '[class*="regular"]', '.price-was', '.old-price', '.strikethrough-price',
    '.price-regular', '.price__original', '[data-price-original]', '.pre-price',
    'del', '.price-before', '.full-price'
  ];
  
  for (const selector of originalPriceSelectors) {
    const element = card.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  // If not found yet, look for text with "Ord.pris" or similar
  const allText = Array.from(card.querySelectorAll('*'))
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .filter(text => 
      text.includes('Ord.pris') || 
      text.includes('Ordinarie') || 
      text.includes('Tidigare') ||
      text.match(/\d+[.,]\d+\s*kr\s*\/\s*\d+[.,]\d+\s*kr/)
    );
    
  if (allText.length > 0) {
    return allText[0];
  }
  
  return null;
}
