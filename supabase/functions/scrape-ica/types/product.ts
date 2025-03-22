
/**
 * Types for product data extracted from ICA website
 */

/**
 * Represents a product extracted from the ICA website
 * Used for storing and processing product information during the scraping process
 */
export interface Product {
  /**
   * The name of the product (e.g., "Äpple Royal Gala")
   */
  name: string;
  
  /**
   * Additional product description or brand information (e.g., "ICA, Ursprung: Italien")
   * Can be null if no description is found
   */
  description: string | null;
  
  /**
   * The current price of the product in SEK
   * Can be null if price information is not available
   */
  price: number | null;
  
  /**
   * URL to the product image
   * Can be null if no image is found
   */
  image_url: string | null;
  
  /**
   * The original price before discount, shown as a string to preserve formatting
   * Can be null if no original price exists (i.e., the product is not on sale)
   */
  original_price: string | null;
  
  /**
   * Price per unit (jämförpris) e.g., "25.90 kr/kg"
   * Can be null if comparison price is not available
   */
  comparison_price: string | null;
  
  /**
   * Details about special offers or promotions (e.g., "3 för 25 kr", "Max 3 köp/hushåll")
   * Can be null if no special offers are available
   */
  offer_details: string | null;
  
  /**
   * Information about the product quantity or weight (e.g., "ca 200g", "500ml")
   * Can be null if quantity information is not available
   */
  quantity_info: string | null;
  
  /**
   * Indicates if the price is a member-only price (Stämmispris)
   * Optional field, defaults to false if not specified
   */
  is_member_price?: boolean;
}
