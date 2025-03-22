
/**
 * Finds product containers in the HTML document using various selectors
 */
export function findProductContainers(document: Document): NodeListOf<Element> | null {
  console.log("Searching for product containers");
  
  // Try multiple different selectors to find product elements
  const selectors = [
    '.product-card', '.offer-card', '.product-item', '[class*="product"]', 
    '[class*="offer"]', '.campaign-item', '.goods-item', '.discount-item',
    'article', '.item[data-price]', '.js-product-card'
  ];
  
  // Try each selector until we find product containers
  for (const selector of selectors) {
    const containers = document.querySelectorAll(selector);
    console.log(`Selector '${selector}' found ${containers.length} elements`);
    
    if (containers.length > 0) {
      return containers;
    }
  }
  
  // If no containers found with specific selectors, try a more generic approach
  console.log("No specific product containers found, trying generic approach");
  
  // Look for elements that have both image and price-like content
  const potentialContainers = Array.from(document.querySelectorAll('div, article, section, li'))
    .filter(el => {
      const hasImg = el.querySelector('img') !== null;
      const hasPriceText = el.textContent?.match(/\d+[,.:]?\d*\s*kr/) !== null;
      return hasImg && hasPriceText;
    });
  
  console.log(`Found ${potentialContainers.length} potential containers with generic approach`);
  
  if (potentialContainers.length > 0) {
    return potentialContainers as unknown as NodeListOf<Element>;
  }
  
  return null;
}
