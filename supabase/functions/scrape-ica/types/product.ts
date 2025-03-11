
/**
 * Types for product data
 */
export interface Product {
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  original_price: string | null;
  comparison_price: string | null;
  offer_details: string | null;
  quantity_info: string | null;
}
