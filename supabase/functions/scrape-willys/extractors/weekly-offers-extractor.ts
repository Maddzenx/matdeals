
import { extractName } from "./name-extractor.ts";
import { extractProductDescription } from "./description-extractor.ts";
import { extractProductImageUrl } from "./image-extractor.ts";
import { extractPrice, extractOriginalPrice } from "./price-extractor.ts";
import { extractOfferDetails } from "./offer-details-extractor.ts";

/**
 * Extracts products from the weekly offers section of the Willys website
 */
export function extractFromWeeklyOffers(document: Document, baseUrl: string): any[] {
  const products: any[] = [];
  
  try {
    console.log("Starting to extract products from weekly offers section");
    
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
      } else {
        // Even more general selectors
        console.log("Trying more general selectors");
        const generalCards = document.querySelectorAll('article, div[class*="product"], div[class*="offer"]');
        console.log(`Found ${generalCards.length} products with general selectors`);
        generalCards.forEach(processProductCard);
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
        
        console.log(`Processing product: ${name}`);
        
        const description = extractProductDescription(card);
        const imageUrl = extractProductImageUrl(card, baseUrl);
        const price = extractPrice(card);
        const originalPrice = extractOriginalPrice(card);
        const offerDetails = extractOfferDetails(card);
        
        // Only add products that have at least a name and a price
        if (name && price !== null) {
          const product = {
            name,
            description: description || 'Ingen beskrivning tillgänglig',
            image_url: imageUrl || 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg',
            price: typeof price === 'number' ? price : 0,
            original_price: typeof originalPrice === 'number' ? originalPrice : null,
            offer_details: offerDetails || 'Erbjudande',
            store: 'willys' // Ensure consistent store name
          };
          
          console.log(`Extracted product: ${name}, price: ${price}`);
          products.push(product);
        } else {
          console.log(`Skipping incomplete product - Name: ${name}, Price: ${price}`);
        }
      } catch (error) {
        console.error("Error processing product card:", error);
      }
    }
    
    console.log(`Total products extracted from weekly offers: ${products.length}`);
    return products;
  } catch (error) {
    console.error("Error extracting weekly offers:", error);
    return [];
  }
}
