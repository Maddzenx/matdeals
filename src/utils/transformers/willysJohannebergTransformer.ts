
import { Product } from "@/data/types";
import { determineProductCategory } from "./determineCategory";

/**
 * Transforms raw Willys Johanneberg data into standardized product format
 */
export const transformWillysJohannebergProducts = (willysJohannebergData: any[]): Product[] => {
  console.log("Transforming Willys Johanneberg data:", willysJohannebergData?.length || 0, "items");
  
  if (!willysJohannebergData || willysJohannebergData.length === 0) {
    console.warn("No Willys Johanneberg data to transform");
    return [];
  }
  
  try {
    const transformedProducts = (willysJohannebergData || []).map((item) => {
      if (!item || !item["Product Name"]) {
        console.warn("Skipping Willys Johanneberg item without name:", item);
        return null;
      }
      
      // Parse the price to ensure it's a number
      let price = null;
      if (typeof item.Price === 'number') {
        price = item.Price;
      } else if (typeof item.Price === 'string') {
        price = parseInt(item.Price, 10);
      }
      
      // Format the price string for display
      let formattedPrice = 'N/A';
      if (price !== null && !isNaN(price)) {
        formattedPrice = `${price}:- kr`;
      }
      
      // Original price is not available in this dataset, use unit price if available
      let originalPriceFormatted = '';
      if (item["Unit Price"] && item["Unit Price"] !== '') {
        originalPriceFormatted = item["Unit Price"];
      }
      
      // Determine product category based on name
      const category = determineProductCategory(item["Product Name"], item["Brand and Weight"] || '');
      
      // Create a stable ID based on name but with a random suffix to avoid collisions
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const productId = `willys-johanneberg-${item["Product Name"].replace(/\s+/g, '-').toLowerCase()}-${randomSuffix}`;
      
      // Always standardize store name to lowercase 'willys' for filtering consistency
      const store = 'willys';
      
      console.log(`Processing Willys Johanneberg item: ${item["Product Name"]} (${productId}), category: ${category}, store: ${store}, price: ${price}`);
      
      // Check if the image URL is valid and use a fallback image
      let imageUrl = item["Product Image"] || 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      if (!imageUrl.startsWith('http')) {
        imageUrl = 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      }
      
      // Combine details from brand and weight with savings if available
      let details = item["Brand and Weight"] || 'Ingen beskrivning tillgänglig';
      if (item["Savings"] && item["Savings"] !== '') {
        details += ` (${item["Savings"]})`;
      }
      
      // Determine offer badge based on labels
      let offerBadge = 'Erbjudande';
      if (item["Label 1"] && item["Label 1"] !== '') {
        offerBadge = item["Label 1"];
      } else if (item["Label 2"] && item["Label 2"] !== '') {
        offerBadge = item["Label 2"];
      }
      
      return {
        id: productId,
        image: imageUrl,
        name: item["Product Name"],
        details: details,
        currentPrice: formattedPrice,
        originalPrice: originalPriceFormatted,
        store: store,
        category: category,
        offerBadge: offerBadge
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed Willys Johanneberg products:", transformedProducts.length);
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming Willys Johanneberg products:", error);
    return [];
  }
};
