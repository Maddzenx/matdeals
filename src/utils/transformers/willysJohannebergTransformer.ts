
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
    const transformedProducts = (willysJohannebergData || []).filter(Boolean).map((item) => {
      if (!item || !item["Product Name"]) {
        console.warn("Skipping Willys Johanneberg item without name:", item);
        return null;
      }
      
      // Sanitize product name to ensure it's a string
      const productName = String(item["Product Name"]).trim();
      
      // Parse the price to ensure it's a number
      let price = null;
      if (typeof item.Price === 'number') {
        price = item.Price;
      } else if (typeof item.Price === 'string') {
        // Try to parse as integer first
        const priceStr = String(item.Price).replace(/[^\d,.]/g, '').replace(',', '.');
        price = parseFloat(priceStr);
      }
      
      // Format the price string for display
      let formattedPrice = 'N/A';
      if (price !== null && !isNaN(price)) {
        // Format as "XX:YY kr", Swedish format
        if (Number.isInteger(price)) {
          formattedPrice = `${price}:- kr`;
        } else {
          const [whole, decimal] = price.toFixed(2).split('.');
          formattedPrice = `${whole}:${decimal} kr`;
        }
      } else if (item.Price && typeof item.Price === 'string') {
        // If we couldn't parse it, use the original string if available
        formattedPrice = item.Price;
      }
      
      // Original price is not available in this dataset, use unit price if available
      let originalPriceFormatted = '';
      if (item["Unit Price"] && item["Unit Price"] !== '') {
        originalPriceFormatted = item["Unit Price"];
      }
      
      // Get any brand and weight information
      const brandAndWeight = item["Brand and Weight"] ? String(item["Brand and Weight"]).trim() : '';
      
      // Determine product category based on name and brand
      const category = determineProductCategory(productName, brandAndWeight);
      
      // Create a stable ID
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const productId = `willys-jberg-${timestamp}-${randomStr}`;
      
      // Always standardize store name to lowercase 'willys' for filtering consistency
      const store = 'willys';
      
      // Check if the image URL is valid and use a fallback image
      let imageUrl = item["Product Image"] || 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      if (!imageUrl.startsWith('http')) {
        imageUrl = 'https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg';
      }
      
      // Combine details from brand and weight with savings if available
      let details = brandAndWeight || 'Ingen beskrivning tillgänglig';
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
      
      console.log(`Processed Willys Johanneberg item: ${productName} (${productId}), category: ${category}, price: ${formattedPrice}`);
      
      return {
        id: productId,
        image: imageUrl,
        name: productName,
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
