
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
      
      // Parse the price to ensure it's a number
      let price = null;
      if (typeof item.price === 'number') {
        price = item.price;
      } else if (typeof item.price === 'string') {
        price = parseInt(item.price, 10);
      }
      
      // Format the price string for display
      let formattedPrice = 'N/A';
      if (price !== null && !isNaN(price)) {
        formattedPrice = `${price}:- kr`;
      }
      
      // Original price formatting
      let originalPriceFormatted = '';
      if (item.original_price !== null && item.original_price !== undefined) {
        const originalPrice = typeof item.original_price === 'number' 
          ? item.original_price 
          : parseInt(item.original_price, 10);
        
        if (!isNaN(originalPrice)) {
          originalPriceFormatted = `${originalPrice}:- kr`;
        }
      }
      
      // Determine product category based on keywords
      const category = determineProductCategory(item.name, item.description || '');
      
      // Create a stable ID based on name but with a random suffix to avoid collisions
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const productId = `willys-${item.name.replace(/\s+/g, '-').toLowerCase()}-${randomSuffix}`;
      
      // Always standardize store name to lowercase 'willys' for filtering consistency
      const store = 'willys';
      
      console.log(`Processing Willys item: ${item.name} (${productId}), category: ${category}, store: ${store}, price: ${price}`);
      
      // Check if the image URL is valid and use a better fallback image
      let imageUrl = item.image_url || 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      if (!imageUrl.startsWith('http')) {
        imageUrl = 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      }
      
      return {
        id: productId,
        image: imageUrl,
        name: item.name,
        details: item.description || 'Ingen beskrivning tillgänglig',
        currentPrice: formattedPrice,
        originalPrice: originalPriceFormatted,
        store: store,  // Always use consistent lowercase 'willys'
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
