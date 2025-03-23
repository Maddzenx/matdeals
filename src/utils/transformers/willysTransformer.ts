
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
      let store = 'willys johanneberg'; // Default to willys johanneberg
      
      // Check if we have a store specific name
      if (item.store && typeof item.store === 'string') {
        store = item.store.toLowerCase();
      }
      
      console.log(`Processing Willys item: ${item.name} (${productId}), category: ${category}, store: ${store}`);
      
      // Check if the image URL is valid
      let imageUrl = item.image_url || 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg';
      if (imageUrl.includes('icanet.se') || imageUrl.includes('assets.icanet')) {
        imageUrl = 'https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg';
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
