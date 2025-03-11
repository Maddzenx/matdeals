
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
    
    // Skip if no name
    if (!name) {
      return null;
    }
    
    // Create a normalized key for deduplication
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Skip if already processed a similar name
    if (processedProductNames.has(normalizedName)) {
      console.log(`Skipping duplicate product: ${name}`);
      return null;
    }
    
    // Extract other product details
    const { description, quantityInfo } = extractProductDescription(card, name);
    const { price, priceStr, originalPrice, comparisonPrice, offerDetails } = extractProductPrice(card);
    const imageUrl = extractProductImageUrl(card, baseUrl);
    
    // Add to processed names to prevent duplicates
    processedProductNames.add(normalizedName);
    
    console.log(`Processed product: ${name} with price: ${price || 'unknown'} (${priceStr || 'no price found'})`);
    if (originalPrice) console.log(`  Original price: ${originalPrice}`);
    if (comparisonPrice) console.log(`  Comparison price: ${comparisonPrice}`);
    if (offerDetails) console.log(`  Offer details: ${offerDetails}`);
    
    return {
      name,
      description,
      price,
      image_url: imageUrl,
      original_price: originalPrice,
      comparison_price: comparisonPrice,
      offer_details: offerDetails,
      quantity_info: quantityInfo
    };
  } catch (cardError) {
    console.error("Error processing a card:", cardError);
    return null;
  }
}
