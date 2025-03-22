
import { useCallback } from "react";
import { Product } from "@/data/types";
import { transformIcaProducts, transformWillysProducts } from "@/utils/transformers";

export const useProductTransformation = () => {
  const transformProducts = useCallback((icaData: any[], willysData: any[]) => {
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
        category: p.category
      })));
    } else {
      console.warn("No ICA products after transformation!");
    }
    
    console.log('Willys products transformed:', willysProducts.length);
    if (willysProducts.length > 0) {
      console.log("First few Willys products:", willysProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        store: p.store,
        category: p.category
      })));
    } else {
      console.warn("No Willys products after transformation!");
    }
    
    // Combine all products
    const allProducts = [...icaProducts, ...willysProducts];
    console.log('Total number of products:', allProducts.length);
    
    // Group products by store for debugging
    const storeCount = allProducts.reduce((acc, product) => {
      const store = product.store?.toLowerCase() || 'unknown';
      acc[store] = (acc[store] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Products by store:', storeCount);
    
    return allProducts;
  }, []);

  return { transformProducts };
};
