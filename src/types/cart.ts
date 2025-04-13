import { Product } from './product';

export interface ShoppingCartProduct extends Product {
  quantity: number;
  checked: boolean;
}

export interface CartItem {
  product: ShoppingCartProduct;
  quantity: number;
}

export type CartState = {
  items: CartItem[];
  total: number;
}; 