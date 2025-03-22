
/**
 * Extracts product price from a card element
 * Main file for price extraction that combines all the specialized extractors
 */
import { findMainPrice } from "./price/main-price-extractor.ts";
import { findOriginalPrice } from "./price/original-price-extractor.ts";
import { findComparisonPrice } from "./price/comparison-price-extractor.ts";
import { findOfferDetails } from "./price/offer-details-extractor.ts";
import { checkForMemberPrice } from "./price/member-price-extractor.ts";

export function extractProductPrice(card: Element): { 
  price: number | null; 
  priceStr: string | null;
  originalPrice: string | null;
  comparisonPrice: string | null;
  offerDetails: string | null;
  isMemberPrice: boolean;
} {
  const price = findMainPrice(card);
  const originalPrice = findOriginalPrice(card);
  const comparisonPrice = findComparisonPrice(card);
  const offerDetails = findOfferDetails(card);
  const isMemberPrice = checkForMemberPrice(card);
  
  return { 
    ...price,
    originalPrice, 
    comparisonPrice, 
    offerDetails, 
    isMemberPrice 
  };
}

// Re-export all the individual methods to maintain the same API
export { findMainPrice, findPriceFromAllText } from "./price/main-price-extractor.ts";
export { findOriginalPrice } from "./price/original-price-extractor.ts";
export { findComparisonPrice } from "./price/comparison-price-extractor.ts";
export { findOfferDetails, findOfferDetailsFromText } from "./price/offer-details-extractor.ts";
export { checkForMemberPrice } from "./price/member-price-extractor.ts";
