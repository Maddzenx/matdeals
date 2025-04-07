export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice: number;
  discount_percentage?: number;
  image_url?: string;
  product_url?: string;
  category?: string;
  store: string;
  store_location?: string;
  position: number;
} 