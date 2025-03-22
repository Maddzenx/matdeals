
/**
 * Finds product containers in the HTML document using various selectors
 */
export function findProductContainers(document: Document): NodeListOf<Element> | Element[] | null {
  console.log("Searching for product containers");
  
  // Try multiple different selectors to find product elements
  const specificSelectors = [
    '.product-card', '.offer-card', '.product-item', '[class*="product"]', 
    '[class*="offer"]', '.campaign-item', '.goods-item', '.discount-item',
    'article', '.item[data-price]', '.js-product-card', '[class*="ProductCard"]',
    '[class*="product-card"]', '[class*="productCard"]', '[class*="offerCard"]',
    '[class*="OfferCard"]'
  ];
  
  // Try each selector until we find product containers
  for (const selector of specificSelectors) {
    const containers = document.querySelectorAll(selector);
    console.log(`Selector '${selector}' found ${containers.length} elements`);
    
    if (containers.length > 0) {
      return containers;
    }
  }
  
  // If no containers found with specific selectors, try a more generic approach
  console.log("No specific product containers found, trying generic approach");
  
  // Look for link elements that contain both image and text (common product card pattern)
  const productLinks = Array.from(document.querySelectorAll('a'))
    .filter(link => {
      const hasImg = link.querySelector('img') !== null;
      const hasPriceText = link.textContent?.match(/\d+[,.:]?\d*\s*(kr|:-)/) !== null;
      return hasImg && hasPriceText;
    });
  
  console.log(`Found ${productLinks.length} product links with image and price`);
  
  if (productLinks.length > 0) {
    return productLinks;
  }
  
  // Look for elements that have both image and price-like content
  const potentialContainers = Array.from(document.querySelectorAll('div, article, section, li'))
    .filter(el => {
      // Check for image
      const hasImg = el.querySelector('img') !== null;
      
      // Check for price text in various formats
      const hasPriceText = el.textContent?.match(/\d+[,.:]?\d*\s*(kr|:-)/) !== null;
      
      // Check for offer-related text 
      const hasOfferText = el.textContent?.match(/(erbjudande|rabatt|spara|kampanj)/i) !== null;
      
      return hasImg && (hasPriceText || hasOfferText);
    });
  
  console.log(`Found ${potentialContainers.length} potential containers with generic approach`);
  
  if (potentialContainers.length > 0) {
    return potentialContainers;
  }
  
  // Last resort: find list items that might be product containers
  const listItems = Array.from(document.querySelectorAll('li'))
    .filter(el => {
      const hasImg = el.querySelector('img') !== null;
      return el.textContent && el.textContent.length > 20 && hasImg;
    });
    
  console.log(`Found ${listItems.length} list items that might be product containers`);
  
  if (listItems.length > 0) {
    return listItems;
  }
  
  return null;
}
