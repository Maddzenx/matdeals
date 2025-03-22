
/**
 * Specialized extractor for product images
 */
export function extractImage(container: Element, baseUrl: string): string {
  const defaultImage = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg';
  
  const imgElement = container.querySelector('img');
  if (!imgElement) return defaultImage;
  
  const src = imgElement.getAttribute('src') || 
            imgElement.getAttribute('data-src') || 
            imgElement.getAttribute('srcset')?.split(' ')[0];
  
  if (!src) return defaultImage;
  
  return src.startsWith('http') ? 
    src : 
    src.startsWith('//') ? 
      `https:${src}` : 
      `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;
}
