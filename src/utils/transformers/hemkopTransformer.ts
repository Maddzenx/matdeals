
import { Product } from "@/data/types";
import { determineProductCategory } from "./determineCategory";

/**
 * Transforms raw Hemkop data into standardized product format
 */
export const transformHemkopProducts = (hemkopData: any[]): Product[] => {
  console.log("Transforming Hemköp data:", hemkopData?.length || 0, "items");
  
  if (!hemkopData || hemkopData.length === 0) {
    console.warn("No Hemköp data to transform");
    return [];
  }
  
  try {
    const transformedProducts = (hemkopData || []).map((item) => {
      if (!item || !item.name) {
        console.warn("Skipping Hemköp item without name:", item);
        return null;
      }
      
      // Parse the price string to get the numeric value
      let formattedPrice = 'N/A';
      if (item.price !== null && item.price !== undefined) {
        formattedPrice = `${item.price}:- kr`;
      }
      
      // Original price formatting
      let originalPriceFormatted = '';
      if (item.original_price !== null && item.original_price !== undefined) {
        originalPriceFormatted = `${item.original_price}:- kr`;
      }
      
      // Determine product category based on keywords
      const category = determineProductCategory(item.name, item.description || '');
      
      const productId = `hemkop-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Make sure we use the store field from the database if available
      const store = (item.store && typeof item.store === 'string') ? item.store.toLowerCase() : 'hemkop';
      
      console.log(`Processing Hemköp item: ${item.name} (${productId}), category: ${category}, store: ${store}`);
      
      return {
        id: productId,
        image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
        name: item.name,
        details: item.description || 'Ingen beskrivning tillgänglig',
        currentPrice: formattedPrice,
        originalPrice: originalPriceFormatted,
        store: store,  // Important: Ensure lowercase matches the store filter
        category: category,
        offerBadge: item.offer_details || 'Erbjudande' // Swedish offer badge
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed Hemköp products:", transformedProducts.length);
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming Hemköp products:", error);
    return [];
  }
};
