
import { Product } from "@/data/types";
import { determineProductCategory } from "./determineCategory";

/**
 * Transforms raw Willys data into standardized product format
 */
export const transformWillysProducts = (willysData: any[]): Product[] => {
  console.log("Transforming Willys data:", willysData?.length || 0, "items");
  
  if (!willysData || willysData.length === 0) {
    console.warn("No Willys data to transform");
    return [];
  }
  
  try {
    const transformedProducts = (willysData || []).map((item) => {
      if (!item || !item.name) {
        console.warn("Skipping Willys item without name:", item);
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
      
      const productId = `willys-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Make sure we use the store field from the database if available
      let store = 'willys';
      
      // Check if we have a store specific name
      if (item.store && typeof item.store === 'string') {
        const storeLower = item.store.toLowerCase();
        // Format the store name nicely
        if (storeLower.includes('johanneberg')) {
          store = 'willys johanneberg';
        } else {
          store = storeLower;
        }
      }
      
      console.log(`Processing Willys item: ${item.name} (${productId}), category: ${category}, store: ${store}`);
      
      // Check if the image URL is from ICA's domain and replace it with Willys default
      let imageUrl = item.image_url || 'https://www.willys.se/content/dam/placeholder-200x200.png';
      if (imageUrl.includes('icanet.se') || imageUrl.includes('assets.icanet')) {
        imageUrl = 'https://www.willys.se/content/dam/placeholder-200x200.png';
      }
      
      return {
        id: productId,
        image: imageUrl,
        name: item.name,
        details: item.description || 'Ingen beskrivning tillgänglig',
        currentPrice: formattedPrice,
        originalPrice: originalPriceFormatted,
        store: store,  // Ensure lowercase matches the store filter
        category: category,
        offerBadge: item.offer_details || 'Erbjudande' // Swedish offer badge
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed Willys products:", transformedProducts.length);
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming Willys products:", error);
    return [];
  }
};
