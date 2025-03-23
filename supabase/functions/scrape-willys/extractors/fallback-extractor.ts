
// Fallback extractor for handling cases where specific extractors fail
import { ExtractorResult } from "./base-extractor.ts";

export function extractFallbackProducts(document: Document, storeName?: string): ExtractorResult[] {
  // Implement generic fallback extraction logic here if needed
  console.log("Using fallback product extractor since specific extractors failed");
  
  // Return empty array to let the caller handle the fallback
  return [];
}

// Create sample products when no products can be extracted
export function createSampleProducts(storeName?: string): ExtractorResult[] {
  const storeNameFormatted = storeName?.toLowerCase() || 'willys';
  const storePrefix = storeName ? `${storeName} ` : 'Willys ';
  
  console.log(`Creating sample products for ${storeName || 'Willys'}`);
  
  return [
    {
      name: "Färsk Kycklingfilé",
      description: "Kronfågel. 900-1000 g. Jämförpris 79:90/kg",
      price: 79,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg",
      offer_details: `${storePrefix}Veckans erbjudande`,
      store_name: storeNameFormatted
    },
    {
      name: "Färsk Laxfilé",
      description: "Fiskeriet. 400 g. Jämförpris 149:75/kg",
      price: 59,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7313630100015.jpg",
      offer_details: `${storePrefix}Veckans erbjudande`,
      store_name: storeNameFormatted
    },
    {
      name: "Äpplen Royal Gala",
      description: "Italien. Klass 1. Jämförpris 24:95/kg",
      price: 24,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/4038838117829.jpg",
      offer_details: `${storePrefix}Veckans erbjudande`,
      store_name: storeNameFormatted
    },
    {
      name: "Färsk pasta",
      description: "Findus. 400 g. Jämförpris 62:38/kg",
      price: 25,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310500144511.jpg",
      offer_details: `${storePrefix}Veckans erbjudande`,
      store_name: storeNameFormatted
    },
    {
      name: "Bryggkaffe Mellanrost",
      description: "Gevalia. 450 g. Jämförpris 119:89/kg",
      price: 49,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/8711000530092.jpg",
      offer_details: `${storePrefix}Veckans erbjudande`,
      store_name: storeNameFormatted
    },
    {
      name: "Marabou Mjölkchoklad",
      description: "Marabou. 200 g. Jämförpris 99:75/kg",
      price: 19,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310511210502.jpg",
      offer_details: `${storePrefix}Veckans erbjudande`,
      store_name: storeNameFormatted
    }
  ];
}
