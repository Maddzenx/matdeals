export interface Product {
  name: string;
  price: number;
  unit: string;
  store: string;
  category: string;
  lastUpdated?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  chainName: string;
  regionCode: string;
  products: Product[];
}

export interface Municipality {
  id: string;
  name: string;
  stores: Store[];
}

export interface Region {
  id: string;
  code: string;
  name: string;
  municipalities: Municipality[];
} 