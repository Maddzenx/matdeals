
import { Product } from "@/data/types";

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
      
      console.log(`Processing ICA item: ${item.name} (${productId}), category: ${category}`);
      
      return {
        id: productId,
        image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
        name: item.name,
        details: baseDescription,
        currentPrice: formattedPrice,
        originalPrice: '',
        store: 'ica',  // Lowercase to match store filter
        category: category,
        offerBadge: 'Erbjudande' // Swedish offer badge
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed ICA products:", transformedProducts.length);
    if (transformedProducts.length > 0) {
      console.log("Sample transformed ICA product:", transformedProducts[0]);
    }
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming ICA products:", error);
    return [];
  }
};

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
      if (!item.name) {
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
      
      console.log(`Processing Willys item: ${item.name} (${productId}), category: ${category}`);
      
      return {
        id: productId,
        image: item.image_url || 'https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg', // Default image
        name: item.name,
        details: item.description || 'Ingen beskrivning tillgänglig',
        currentPrice: formattedPrice,
        originalPrice: originalPriceFormatted,
        store: 'willys',  // Important: Ensure lowercase matches the store filter
        category: category,
        offerBadge: item.offer_details || 'Erbjudande' // Swedish offer badge
      };
    }).filter(Boolean) as Product[];
    
    console.log("Transformed Willys products:", transformedProducts.length);
    if (transformedProducts.length > 0) {
      console.log("Sample transformed Willys product:", transformedProducts[0]);
    }
    
    return transformedProducts;
  } catch (error) {
    console.error("Error transforming Willys products:", error);
    return [];
  }
};

/**
 * Determines the category of a product based on description and name keywords
 */
export const determineProductCategory = (name: string, description: string): string => {
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  // Combined check of name and description for better categorization
  const combined = lowerName + ' ' + lowerDesc;
  
  // Map Swedish category names directly to category IDs that match what's expected in the UI
  if (combined.includes('grönsak') || combined.includes('frukt') || 
      combined.includes('äpple') || combined.includes('banan') ||
      combined.includes('mango')) {
    return 'fruits';
  } else if (combined.includes('kött') || combined.includes('fläsk') || 
             combined.includes('nöt') || combined.includes('bacon') ||
             combined.includes('kyckl')) {
    return 'meat';
  } else if (combined.includes('fisk') || combined.includes('lax') ||
             combined.includes('torsk') || combined.includes('skaldjur')) {
    return 'fish';
  } else if (combined.includes('mjölk') || combined.includes('ost') || 
             combined.includes('grädde') || combined.includes('yoghurt') ||
             combined.includes('gräddfil')) {
    return 'dairy';
  } else if (combined.includes('snack') || combined.includes('chips') || 
             combined.includes('godis') || combined.includes('choklad')) {
    return 'snacks';
  } else if (combined.includes('bröd') || combined.includes('bulle') ||
             combined.includes('kaka')) {
    return 'bread';
  } else if (combined.includes('dryck') || combined.includes('läsk') ||
             combined.includes('juice') || combined.includes('vatten') ||
             combined.includes('kaffe')) {
    return 'drinks';
  }
  
  return 'other';
};
