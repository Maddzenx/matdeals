import { useCallback } from "react";
import { Product } from "@/data/types";
import { transformIcaProducts, transformWillysProducts } from "@/utils/transformers";

interface RawProduct {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image?: string;
  store: string;
  category?: string;
  details?: string;
  offerBadge?: string;
  [key: string]: unknown;
}

export const useProductTransformation = () => {
  const transformProducts = useCallback((icaData: RawProduct[], willysData: RawProduct[]) => {
    console.log("Starting product transformation");
    
    // Transform products using our utility functions
    const icaProducts = transformIcaProducts(icaData);
    const willysProducts = transformWillysProducts(willysData);
    
    // Log products to help debugging
    console.log('ICA products transformed:', icaProducts.length);
    if (icaProducts.length > 0) {
      console.log("First few ICA products:", icaProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        store: p.store,
      })));
    }
    
    console.log('Willys products transformed:', willysProducts.length);
    if (willysProducts.length > 0) {
      console.log("First few Willys products:", willysProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        store: p.store,
      })));
    }
    
    // Combine all products
    const allProducts = [...icaProducts, ...willysProducts];
    console.log('Total products after transformation:', allProducts.length);
    
    return allProducts;
  }, []);

  return { transformProducts };
};
