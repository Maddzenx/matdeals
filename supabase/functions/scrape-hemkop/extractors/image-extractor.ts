
/**
 * Specialized extractor for product images
 */
export function extractImage(container: Element, baseUrl: string): string {
  console.log("Extracting image from container:", container.className || container.tagName);
  
  const defaultImage = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg';
  
  // Try to find image with various strategies
  const strategies = [
    // Strategy 1: Standard img element
    () => {
      const img = container.querySelector('img');
      return img ? (img.getAttribute('src') || null) : null;
    },
    // Strategy 2: Lazy-loaded images
    () => {
      const img = container.querySelector('img[data-src], img[loading="lazy"]');
      return img ? (img.getAttribute('data-src') || img.getAttribute('src') || null) : null;
    },
    // Strategy 3: Background image in style
    () => {
      const elementsWithBg = container.querySelectorAll('[style*="background-image"]');
      if (elementsWithBg.length > 0) {
        const style = elementsWithBg[0].getAttribute('style') || '';
        const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        return match ? match[1] : null;
      }
      return null;
    },
    // Strategy 4: Picture element
    () => {
      const picture = container.querySelector('picture');
      if (picture) {
        const source = picture.querySelector('source');
        return source ? (source.getAttribute('srcset') || null) : null;
      }
      return null;
    },
    // Strategy 5: Any element with srcset
    () => {
      const element = container.querySelector('[srcset]');
      if (element) {
        const srcset = element.getAttribute('srcset');
        return srcset ? srcset.split(' ')[0] : null;
      }
      return null;
    }
  ];
  
  // Try each strategy until we find an image
  for (const strategy of strategies) {
    const src = strategy();
    if (src) {
      console.log(`Found image: ${src}`);
      
      // Format the URL correctly
      const formattedUrl = src.startsWith('http') ? 
        src : 
        src.startsWith('//') ? 
          `https:${src}` : 
          `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
      
      console.log(`Formatted image URL: ${formattedUrl}`);
      return formattedUrl;
    }
  }
  
  // No image found, use default
  console.log(`No image found, using default: ${defaultImage}`);
  return defaultImage;
}
