
import { Product as BaseProduct } from './product';

declare module './product' {
  interface Product extends BaseProduct {
    is_kortvara?: boolean;
  }
}
