
/**
 * Unified ExtractorResult interface to be used across all extractors
 */
export interface ExtractorResult {
  name: string;
  price: string | number;
  description?: string | null;
  image_url?: string;
  original_price?: string | number | null;
  comparison_price?: string | null;
  quantity_info?: string | null;
  is_member_price?: boolean;
  offer_details?: string;
  store?: string;
  store_location?: string;
  store_name?: string; // Added to fix generic-extractor errors
  index?: number;
  
  // Legacy properties used in some extractors - added to prevent type errors
  "Product Name"?: string;
  "Brand and Weight"?: string;
  "Price"?: number | string;
  "Product Image"?: string;
  "Product Link"?: string;
  "Label 1"?: string;
  "Label 2"?: string;
  "Label 3"?: string;
  "Savings"?: number;
  "Unit Price"?: string;
  "Purchase Limit"?: string;
  "Position"?: number;
}
