
export interface Product {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  category?: string;
  unitPrice?: string;
  offer_details?: string;
  price?: number | string;
  position?: number;
  is_kortvara?: boolean;
}

export interface CategoryData {
  id: string;
  name: string;
}
