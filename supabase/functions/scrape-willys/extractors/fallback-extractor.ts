
import { ExtractorResult } from "../types.ts";

/**
 * Creates sample products when scraping fails
 * @param store The store name
 * @returns Array of sample products
 */
export function createSampleProducts(store: string): ExtractorResult[] {
  console.log(`Creating sample products for ${store}`);
  
  const sampleProducts: ExtractorResult[] = [
    {
      name: "Äpple Royal Gala",
      price: 29.90,
      description: "Lösvikt, Italien, Klass 1",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7340011446538.jpg",
      original_price: 39.90,
      comparison_price: "29.90 kr/kg",
      offer_details: "Veckans erbjudande",
      quantity_info: "ca 150g/st",
      is_member_price: false,
      store,
      store_location: "johanneberg"
    },
    {
      name: "Falukorv",
      price: 39.90,
      description: "Scan, 800g",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg",
      original_price: 49.90,
      comparison_price: "49.88 kr/kg",
      offer_details: "Veckans erbjudande",
      quantity_info: "800g",
      is_member_price: false,
      store,
      store_location: "johanneberg"
    },
    {
      name: "Pasta Penne",
      price: 15.90,
      description: "Barilla, 500g",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/8076809513722.jpg",
      original_price: 18.90,
      comparison_price: "31.80 kr/kg",
      offer_details: "Veckans erbjudande",
      quantity_info: "500g",
      is_member_price: false,
      store,
      store_location: "johanneberg"
    }
  ];
  
  return sampleProducts;
}
