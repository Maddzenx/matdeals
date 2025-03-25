
import { extractName } from "./name-extractor.ts";
import { extractProductDescription } from "./description-extractor.ts";
import { extractImage } from "./image-extractor.ts";
import { extractPrice, extractOriginalPrice } from "./price-extractor.ts";
import { extractOfferDetails } from "./offer-details-extractor.ts";

/**
 * Extracts products from the weekly offers section of the Willys website
 */
export function extractFromWeeklyOffers(document: Document, baseUrl: string): any[] {
  const products: any[] = [];
  
  try {
    // Find all product cards in the weekly offers section
    // This targets products with specific offer sections
    const productCards = document.querySelectorAll('.product-card, .product-offer, .js-product-card, [data-testid="product-card"]');
    
    console.log(`Found ${productCards.length} potential product cards in weekly offers section`);
    
    if (productCards.length === 0) {
      console.log("No product cards found in weekly offers section, trying alternative selectors");
      
      // Alternative selectors if the primary ones don't work
      const altProductCards = document.querySelectorAll('.product-item, .product, .offer-product');
      console.log(`Found ${altProductCards.length} products with alternative selectors`);
      
      if (altProductCards.length > 0) {
        altProductCards.forEach(processProductCard);
      }
    } else {
      productCards.forEach(processProductCard);
    }
    
    function processProductCard(card: Element) {
      try {
        // Extract product details using specialized extractors
        const name = extractName(card);
        
        // Skip products without a name
        if (!name) {
          console.log("Skipping product without name");
          return;
        }
        
        const description = extractProductDescription(card);
        const imageUrl = extractImage(card, baseUrl);
        const price = extractPrice(card);
        const originalPrice = extractOriginalPrice(card);
        const offerDetails = extractOfferDetails(card);
        
        const product = {
          name,
          description,
          image_url: imageUrl,
          price: typeof price === 'string' ? parseFloat(price) : price,
          original_price: typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice,
          offer_details: offerDetails,
          store: 'willys' // Ensure consistent store name
        };
        
        console.log(`Extracted product: ${name}, price: ${price}`);
        products.push(product);
      } catch (error) {
        console.error("Error processing product card:", error);
      }
    }
    
    return products;
  } catch (error) {
    console.error("Error extracting weekly offers:", error);
    return [];
  }
}
