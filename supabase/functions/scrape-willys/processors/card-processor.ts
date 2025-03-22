
import { Product } from "../types/product.ts";
import { extractProductName } from "../extractors/name-extractor.ts";
import { extractProductDescription } from "../extractors/description-extractor.ts";
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { extractProductImageUrl } from "../extractors/image-extractor.ts";
import { extractOfferDetails } from "../extractors/offer-details-extractor.ts";

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
    
    if (!name) {
      return null;
    }
    
    // Normalize name for deduplication
    const normalizedName = name.toLowerCase().trim();
    
    if (!normalizedName || processedProductNames.has(normalizedName)) {
      return null;
    }
    
    // Extract other product details
    const description = extractProductDescription(card);
    const { price, originalPrice } = extractProductPrice(card);
    const imageUrl = extractProductImageUrl(card, baseUrl);
    
    // Add to processed names
    processedProductNames.add(normalizedName);
    
    return {
      name,
      description,
      price,
      image_url: imageUrl,
      original_price: originalPrice,
      offer_details: extractOfferDetails(card)
    };
  } catch (cardError) {
    console.error("Error processing a card:", cardError);
    return null;
  }
}
