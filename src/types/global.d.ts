
import { Product as BaseProduct } from './product';

declare module './product' {
  interface Product extends BaseProduct {
    is_kortvara?: boolean;
  }
}

// Add a global declaration for Deno DOM types to fix TypeScript errors
declare namespace DenoDOM {
  interface Document {
    querySelector(selector: string): Element | null;
    querySelectorAll(selector: string): NodeListOf<Element>;
    [key: string]: any;
  }
  
  interface Element {
    querySelector(selector: string): Element | null;
    querySelectorAll(selector: string): NodeListOf<Element>;
    getAttribute(name: string): string | null;
    textContent: string | null;
    innerHTML: string;
    [key: string]: any;
  }
}
