
import { Product as TypesProduct } from '@/types/product';
import { Product as DataProduct } from '@/data/types';

/**
 * Converts a Product from types/product.ts to data/types.ts format
 * This is needed because some components expect one format while others expect another
 */
export const adaptToDataProduct = (product: TypesProduct): DataProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    details: product.details || product.description || "",
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    currentPrice: product.currentPrice || `${product.price || 0} kr`,
    originalPrice: product.originalPrice?.toString() || "",
    store: product.store,
    image: product.image || product.image_url || "https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg",
    category: product.category || "",
    offerBadge: product.offerBadge || product.offer_details || "",
    isDiscounted: product.discount_percentage !== undefined && product.discount_percentage > 0,
    brand: "",
    unit: product.unitPrice || ""
  };
};

/**
 * Converts an array of Products from types/product.ts to data/types.ts format
 */
export const adaptToDataProducts = (products: TypesProduct[]): DataProduct[] => {
  return products.map(adaptToDataProduct);
};
