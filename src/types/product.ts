
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  originalPrice?: number | string;
  discount_percentage?: number;
  image_url?: string;
  product_url?: string;
  category?: string;
  store: string;
  store_location?: string;
  position?: number;
  offer_details?: string;
  unitPrice?: string;
  image?: string;
  details?: string;
  currentPrice?: string;
  offerBadge?: string;
}
