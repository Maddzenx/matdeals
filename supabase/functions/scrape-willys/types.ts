
/**
 * Result from product extraction
 */
export interface ExtractorResult {
  // Basic product information
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  
  // Price-related information
  original_price: number | null;
  comparison_price: string | null;
  offer_details: string | null;
  
  // Additional information
  quantity_info: string | null;
  is_member_price: boolean;
  
  // Store information
  store: string;
  store_location: string | null;
  
  // Legacy fields for compatibility with older implementations
  "Product Name"?: string;
  "Brand and Weight"?: string;
  "Price"?: number;
  "Product Image"?: string;
  "Product Link"?: string;
  "Label 1"?: string;
  "Label 2"?: string;
  "Label 3"?: string;
  "Savings"?: string;
  "Unit Price"?: string;
  "Purchase Limit"?: string;
  "Position"?: number;
  index?: number;
  store_name?: string;
}
