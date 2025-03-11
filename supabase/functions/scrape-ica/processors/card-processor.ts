
import { Product } from "../types/product.ts";
import { extractProductName } from "../extractors/name-extractor.ts";
import { extractProductDescription } from "../extractors/description-extractor.ts";
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { extractProductImageUrl } from "../extractors/image-extractor.ts";

/**
 * Processes a single product card and extracts product information
 */
export function processProductCard(
  card: Element, 
  baseUrl: string, 
  processedProductNames: Set<string>
): Product | null {
  try {
    // Extract product name
    const name = extractProductName(card);
    
    // Skip if no name or already processed
    if (!name || processedProductNames.has(name)) {
      return null;
    }
    
    // Extract other product details
    const description = extractProductDescription(card, name);
    const { price, priceStr } = extractProductPrice(card);
    const imageUrl = extractProductImageUrl(card, baseUrl);
    
    // Add to processed names to prevent duplicates
    processedProductNames.add(name);
    
    console.log(`Processed product: ${name} with price: ${price || 'unknown'} (${priceStr || 'no price found'})`);
    
    return {
      name,
      description,
      price,
      image_url: imageUrl
    };
  } catch (cardError) {
    console.error("Error processing a card:", cardError);
    return null;
  }
}
