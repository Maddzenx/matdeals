
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
}

export interface CategoryData {
  id: string;
  name: string;
}
