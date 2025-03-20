
import { ExtractorResult, normalizeImageUrl, extractPrice } from './base-extractor.ts';

export function extractGenericProducts(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Trying strategy 3: Generic product search");
  const products: ExtractorResult[] = [];
  const processedProductNames = new Set<string>();
  
  // Look for any element that might contain product information
  const possibleProducts = document.querySelectorAll('div, article, section, li');
  console.log(`Found ${possibleProducts.length} possible product containers`);
  
  for (let i = 0; i < possibleProducts.length; i++) {
    const container = possibleProducts[i];
    
    try {
      // Skip elements that are too small
      if (container.children.length < 2) continue;
      
      // Look for price and name elements
      let priceElem = container.querySelector('[class*="price"], [class*="pris"], [class*="cost"], strong, b');
      let nameElem = container.querySelector('[class*="name"], [class*="title"], h2, h3, h4, span');
      
      if (priceElem && nameElem) {
        const name = nameElem.textContent?.trim();
        const priceText = priceElem.textContent?.trim();
        
        if (name && priceText && !processedProductNames.has(name.toLowerCase())) {
          processedProductNames.add(name.toLowerCase());
          
          // Extract numeric price
          const price = extractPrice(priceText);
          
          const imageElem = container.querySelector('img');
          const imageUrl = imageElem ? (imageElem.getAttribute('src') || imageElem.getAttribute('data-src')) : null;
          
          const finalImageUrl = normalizeImageUrl(imageUrl, baseUrl);
          
          products.push({
            name,
            price: price || 99, // Fallback price
            description: name,
            image_url: finalImageUrl,
            offer_details: "Erbjudande"
          });
          
          console.log(`Extracted product using strategy 3: ${name} with price: ${price}`);
        }
      }
    } catch (error) {
      // Just continue, this is our last-chance strategy
    }
  }
  
  return products;
}
