
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
    // Only consider the main product name for deduplication (remove numbers and special formatting)
    const normalizedName = name.toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\d+\s*(för|st|kr|pack|kg|g)/gi, '') // Remove quantity indicators
      .replace(/^(ca\.|ca)\s+/i, '')  // Remove "ca." prefix
      .trim();
    
    // Skip if empty name after normalization
    if (!normalizedName) {
      return null;
    }
    
    // Skip if already processed a similar name, but be careful not to skip too much
    // Only skip exact matches or very similar products
    const isDuplicate = Array.from(processedProductNames).some(existingName => {
      // Check for exact match
      if (existingName === normalizedName) return true;
      
      // Check for high similarity (one is contained completely in the other)
      if (existingName.includes(normalizedName) && normalizedName.length > 5) return true;
      if (normalizedName.includes(existingName) && existingName.length > 5) return true;
      
      return false;
    });
    
    if (isDuplicate) {
      console.log(`Skipping duplicate product: ${name} (normalized: ${normalizedName})`);
      return null;
    }
    
    // Extract other product details
    const { description, quantityInfo } = extractProductDescription(card, name);
    const { price, priceStr, originalPrice, comparisonPrice, offerDetails } = extractProductPrice(card);
    const imageUrl = extractProductImageUrl(card, baseUrl);
    
    // Only add to processed names if we got a valid price
    // This allows different variants of the same product to be included if they have different prices
    if (price !== null) {
      processedProductNames.add(normalizedName);
    }
    
    console.log(`Processed product: ${name} with price: ${price || 'unknown'} (${priceStr || 'no price found'})`);
    if (originalPrice) console.log(`  Original price: ${originalPrice}`);
    if (comparisonPrice) console.log(`  Comparison price: ${comparisonPrice}`);
    if (offerDetails) console.log(`  Offer details: ${offerDetails}`);
    if (quantityInfo) console.log(`  Quantity info: ${quantityInfo}`);
    
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
