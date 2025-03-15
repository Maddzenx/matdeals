
import { Product } from "../types/product.ts";
import { extractProductName } from "./name-extractor.ts";
import { extractProductDescription } from "./description-extractor.ts";
import { extractProductPrice } from "./price-extractor.ts";
import { extractProductImageUrl } from "./image-extractor.ts";

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
    
    // Skip if already processed a similar name
    const isDuplicate = Array.from(processedProductNames).some(existingName => {
      if (existingName === normalizedName) return true;
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
    if (price !== null) {
      processedProductNames.add(normalizedName);
    }
    
    console.log(`Processed product: ${name} with price: ${price || 'unknown'}`);
    
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

/**
 * Extracts all products from the provided offer cards
 */
export function extractProducts(offerCards: Element[], baseUrl: string): Product[] {
  const products: Product[] = [];
  const processedProductNames = new Set<string>();
  
  for (const card of offerCards) {
    const product = processProductCard(card, baseUrl, processedProductNames);
    if (product) {
      products.push(product);
    }
  }
  
  console.log(`Successfully processed ${products.length} products out of ${offerCards.length} elements`);
  
  if (products.length === 0) {
    console.error("No products were found. HTML structure might have changed.");
    throw new Error("No products found on the page. The website structure may have changed.");
  }
  
  return products;
}
