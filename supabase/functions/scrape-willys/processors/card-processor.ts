
import extractName from "../extractors/name-extractor.ts";
import extractPrice from "../extractors/price-extractor.ts";
import { ExtractorResult } from "../types.ts";

/**
 * Process a product card element to extract product details
 * @param cardElement The product card element to process
 * @param store The store name
 * @returns Product information object or null if extraction failed
 */
export function processCard(cardElement: Element, store: string = "Willys"): ExtractorResult | null {
  try {
    // Extract name
    const name = extractName(cardElement);
    
    if (!name || name === "Unknown Product") {
      console.warn("Failed to extract product name, skipping card");
      return null;
    }
    
    // Extract price
    const price = extractPrice(cardElement);
    
    if (!price) {
      console.warn(`Failed to extract price for product: ${name}, skipping card`);
      return null;
    }
    
    // Process image
    let imageUrl = null;
    const imgElement = cardElement.querySelector('img');
    if (imgElement) {
      imageUrl = imgElement.getAttribute('src');
      
      // If src is not available, try data-src (lazy loading)
      if (!imageUrl) {
        imageUrl = imgElement.getAttribute('data-src');
      }
    }
    
    // Process description/brand
    let description = null;
    const brandElement = cardElement.querySelector('.brand, [class*="brand"], [class*="subtitle"], p:not([class*="price"])');
    if (brandElement && brandElement.textContent) {
      description = brandElement.textContent.trim();
    }
    
    // Process offer details
    let offerDetails = '';
    const offerElement = cardElement.querySelector('.offer, [class*="campaign"], [class*="offer"], [class*="badge"]');
    if (offerElement && offerElement.textContent) {
      offerDetails = offerElement.textContent.trim();
    }
    
    return {
      name,
      price,
      description,
      image_url: imageUrl,
      offer_details: offerDetails || null,
      store,
      original_price: null,
      comparison_price: null,
      quantity_info: null,
      is_member_price: false
    };
    
  } catch (error) {
    console.error("Error processing product card:", error);
    return null;
  }
}
