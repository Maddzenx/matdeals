
import { ExtractorResult, normalizeImageUrl, extractPrice } from './base-extractor.ts';

export function extractGridItems(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Trying strategy 2: Product grid items");
  const products: ExtractorResult[] = [];
  const processedProductNames = new Set<string>();
  
  const productItems = document.querySelectorAll('.product-grid-item, .product-list-item, .grid-item, .product, [class*="product-item"], [class*="grid-product"], .product-item, li, .ProductOfferBox, [class*="ProductOfferBox"]');
  
  if (productItems && productItems.length > 0) {
    console.log(`Found ${productItems.length} product grid items`);
    
    for (let i = 0; i < productItems.length; i++) {
      const item = productItems[i];
      
      try {
        const nameElement = item.querySelector('h3, .name, .product-name, .title, [class*="name"], [class*="title"], h2, h4, span');
        const name = nameElement ? nameElement.textContent?.trim() : null;
        
        if (!name || processedProductNames.has(name.toLowerCase())) {
          continue;
        }
        
        processedProductNames.add(name.toLowerCase());
        
        const priceElement = item.querySelector('.price, .product-price, .offer-price, [class*="price"], b, strong');
        const priceText = priceElement ? priceElement.textContent?.trim() : null;
        const price = extractPrice(priceText);
        
        const imageElement = item.querySelector('img, [class*="image"], picture img');
        const imageUrl = imageElement ? (imageElement.getAttribute('src') || imageElement.getAttribute('data-src')) : null;
        
        const descriptionElement = item.querySelector('.description, .product-description, .details, [class*="description"], small, p');
        const description = descriptionElement ? descriptionElement.textContent?.trim() : null;
        
        const finalImageUrl = normalizeImageUrl(imageUrl, baseUrl);
        
        products.push({
          name,
          price: price || 99, // Fallback price if not found
          description: description || `${name}`,
          image_url: finalImageUrl,
          offer_details: "Erbjudande"
        });
        
        console.log(`Extracted product: ${name} with price: ${price}`);
      } catch (error) {
        console.error("Error extracting individual product in strategy 2:", error);
      }
    }
  } else {
    console.log("No product items found with strategy 2");
  }
  
  return products;
}
