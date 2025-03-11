
/**
 * Extracts product image URL from a card element
 */
export function extractProductImageUrl(card: Element, baseUrl: string): string | null {
  const imageSelectors = [
    'img.offer-card__image-inner', '.product-image img', '.product-card__product-image img',
    '.offer-card-v3__image', 'img', '[class*="image"] img', '.promotion-item__image img',
    '.product__image img', '.item__image img', 'picture img', 'figure img'
  ];
  
  for (const selector of imageSelectors) {
    const element = card.querySelector(selector);
    if (element) {
      const imageUrl = element.getAttribute('src') || element.getAttribute('data-src');
      
      // Make sure the URL is absolute
      if (imageUrl) {
        return imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, baseUrl).href;
      }
    }
  }
  
  // Check for <picture> element with srcset if no direct image found
  const picture = card.querySelector('picture');
  if (picture) {
    const source = picture.querySelector('source');
    if (source) {
      const srcset = source.getAttribute('srcset');
      if (srcset) {
        const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
        if (firstSrc) {
          return firstSrc.startsWith('http') ? firstSrc : new URL(firstSrc, baseUrl).href;
        }
      }
    }
  }
  
  return null;
}
