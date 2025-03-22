
/**
 * Extracts product image URL from a card element
 */
export function extractProductImageUrl(card: Element, baseUrl: string): string {
  // Try various selectors for product image with Willys-specific selectors
  const imgSelectors = [
    'img.product-image', 
    '.product-image img', 
    '.product-card__image img',
    '.productCard__image img',
    '.product-list-item__image img',
    'img.lazy-image',
    '.image-container img',
    '[data-testid="product-image"] img',
    '[class*="productImage"] img',
    'img[src*="willys"]',
    'img',
    '[class*="image"] img',
    '[data-test="product-image"]'
  ];
  
  for (const selector of imgSelectors) {
    const imgElement = card.querySelector(selector);
    if (imgElement) {
      // Try different image attributes (Willys may use data-src for lazy loading)
      const src = imgElement.getAttribute('src') || 
                  imgElement.getAttribute('data-src') || 
                  imgElement.getAttribute('data-lazy-src');
      
      if (src) {
        // Handle relative URLs
        if (src.startsWith('http')) {
          // Skip ICA domain images
          if (src.includes('icanet.se') || src.includes('assets.icanet')) {
            continue;
          }
          return src;
        } else {
          return `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
        }
      }
    }
  }
  
  // Search for background image in style attribute
  const elementWithBgImage = card.querySelector('[style*="background-image"]');
  if (elementWithBgImage) {
    const style = elementWithBgImage.getAttribute('style');
    if (style) {
      const match = style.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        const bgImageUrl = match[1];
        if (!bgImageUrl.includes('icanet.se')) {
          return bgImageUrl.startsWith('http') ? bgImageUrl : `${baseUrl}${bgImageUrl.startsWith('/') ? '' : '/'}${bgImageUrl}`;
        }
      }
    }
  }
  
  // Default image if none found (Willys default placeholder)
  return 'https://www.willys.se/content/dam/placeholder-200x200.png';
}
