
import { ExtractorResult, normalizeImageUrl, extractPrice } from './base-extractor.ts';

export function extractWeeklyOffers(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Trying strategy 1: Weekly offers");
  const products: ExtractorResult[] = [];
  const processedProductNames = new Set<string>();
  
  const offerCards = document.querySelectorAll('.js-product-offer-card, .product-offer-card, .product-card, [class*="product-card"], [class*="offer-card"], .product, [class*="product"], article, .grid-card, .grid-item');
  
  if (offerCards && offerCards.length > 0) {
    console.log(`Found ${offerCards.length} offer cards in the weekly offers section`);
    
    for (let i = 0; i < offerCards.length; i++) {
      const card = offerCards[i];
      
      try {
        // Extract product information
        const nameElement = card.querySelector('.product-card__name, .js-product-name, .product-name, h3, [class*="name"], [data-testid*="name"], h2, .title, [class*="title"], .heading');
        const name = nameElement ? nameElement.textContent?.trim() : null;
        
        // Skip products without names
        if (!name) {
          continue;
        }
        
        // Skip duplicates
        if (processedProductNames.has(name.toLowerCase())) {
          continue;
        }
        
        processedProductNames.add(name.toLowerCase());
        
        const priceElement = card.querySelector('.product-card__price, .js-product-price, .product-price, .price, [class*="price"], [data-testid*="price"], span[class*="price"], .Price-module--currency--, strong');
        const priceText = priceElement ? priceElement.textContent?.trim() : null;
        const price = extractPrice(priceText);
        
        const imageElement = card.querySelector('img, [class*="image"], [data-testid*="image"]');
        let imageUrl = imageElement ? (imageElement.getAttribute('src') || imageElement.getAttribute('data-src')) : null;
        
        // Fallback for lazy-loaded images
        if (!imageUrl) {
          const lazyImgs = card.querySelectorAll('[data-src], [data-lazy], [data-original], [src], source');
          for (let j = 0; j < lazyImgs.length; j++) {
            const src = lazyImgs[j].getAttribute('data-src') || 
                       lazyImgs[j].getAttribute('data-lazy') || 
                       lazyImgs[j].getAttribute('data-original') ||
                       lazyImgs[j].getAttribute('src');
            if (src && src.includes('jpg')) {
              imageUrl = src;
              break;
            }
          }
        }
        
        const descriptionElement = card.querySelector('.product-card__description, .js-product-description, .product-description, [class*="description"], [data-testid*="description"], .sub-title, [class*="subtitle"], .subtitles, small, p');
        const description = descriptionElement ? descriptionElement.textContent?.trim() : null;
        
        const offerElement = card.querySelector('.badge, .offer-badge, .js-offer-badge, [class*="badge"], [class*="offer"], .label, .promotion');
        const offerDetails = offerElement ? offerElement.textContent?.trim() : "Erbjudande";
        
        const finalImageUrl = normalizeImageUrl(imageUrl, baseUrl);
        
        products.push({
          name,
          price: price || 99, // Fallback price if not found
          description: description || `${name}`,
          image_url: finalImageUrl,
          offer_details: offerDetails
        });
        
        console.log(`Extracted product: ${name} with price: ${price}, image: ${finalImageUrl.substring(0, 40)}...`);
      } catch (error) {
        console.error("Error extracting individual product:", error);
      }
    }
  } else {
    console.log("No offer cards found with strategy 1");
  }
  
  return products;
}
