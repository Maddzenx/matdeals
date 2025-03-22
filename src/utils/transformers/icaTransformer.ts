
import { Product } from "@/data/types";
import { determineProductCategory } from "./determineCategory";

/**
 * Transforms raw ICA data into standardized product format
 */
export const transformIcaProducts = (icaData: any[]): Product[] => {
  console.log("Transforming ICA data:", icaData?.length || 0, "items");
  
  if (!icaData || icaData.length === 0) {
    console.warn("No ICA data to transform");
    return [];
  }
  
  try {
    const transformedProducts = icaData.map((item) => {
      if (!item || !item.name) {
        console.warn("Skipping ICA item without name:", item);
        return null;
      }
      
      // Extract detailed information from the combined description field
      const descriptionParts = item.description ? item.description.split(' | ') : [];
      const baseDescription = descriptionParts[0] || 'Ingen beskrivning tillgänglig';
      
      // Parse the price string to get the numeric value
      let formattedPrice = 'N/A';
      if (item.price !== null && item.price !== undefined) {
        formattedPrice = `${item.price}:- kr`;
      }
      
      // Determine product category based on keywords
      const category = determineProductCategory(item.name, item.description || '');
      
      const productId = `ica-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Always set store to lowercase for consistency
      const store = 'ica';
      
      // Determine if it's a member price and create appropriate badge text
      const isMemberPrice = item.is_member_price === true;
      const offerBadge = isMemberPrice ? 'Stämmispris' : 'Erbjudande';
      
      console.log(`Processing ICA item: ${item.name} (${productId}), category: ${category}, member price: ${isMemberPrice}`);
      
      return {
        id: productId,
        image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
        name: item.name,
        details: baseDescription,
        currentPrice: formattedPrice,
        originalPrice: '',
        store: store,  // Lowercase to match store filter
        category: category,
        offerBadge: offerBadge // Swedish offer badge with member price distinction
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed ICA products:", transformedProducts.length);
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming ICA products:", error);
    return [];
  }
};
