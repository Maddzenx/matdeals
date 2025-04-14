
export interface Product {
  id: string;
  name: string;
  description?: string;
  details?: string;
  price?: number;
  originalPrice?: string;
  currentPrice: string;
  image: string;
  store: string;
  isDiscounted?: boolean;
  category: string;
  brand?: string;
  unit?: string;
  quantity?: number;
  url?: string;
  lastUpdated?: string;
  offerBadge?: string;
}

export interface CategoryData {
  id: string;
  name: string;
}
