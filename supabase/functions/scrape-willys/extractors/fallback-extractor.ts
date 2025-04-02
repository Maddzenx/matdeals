import { ExtractorResult } from "./base-extractor.ts";

/**
 * Creates sample products when no products can be extracted from the page
 */
export function createSampleProducts(store: string = "willys"): ExtractorResult[] {
  console.log(`Creating sample products for ${store}`);
  
  // Sample products with Willys-style formatting
  return [
    {
      name: "Äpple Royal Gala",
      description: "Willys, Italien, Klass 1",
      price: 24.90,
      original_price: 29.90,
      comparison_price: "24.90 kr/kg",
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      offer_details: "Veckans erbjudande",
      quantity_info: "1 kg",
      is_member_price: false,
      store: store,
      store_location: null
    },
    {
      name: "Färsk Kycklingfilé",
      description: "Kronfågel, Sverige, 700-925g",
      price: 89.90,
      original_price: 109.90,
      comparison_price: "89.90 kr/kg",
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      offer_details: "Veckans erbjudande",
      quantity_info: "700-925g",
      is_member_price: false,
      store: store,
      store_location: null
    },
    {
      name: "Kavli Mjukost",
      description: "Willys, Flera smaker, 275g",
      price: 29.90,
      original_price: 34.90,
      comparison_price: "108.73 kr/kg",
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      offer_details: "Veckans erbjudande",
      quantity_info: "275g",
      is_member_price: false,
      store: store,
      store_location: null
    },
    {
      name: "Nötfärs 12%",
      description: "Svenskt Butikskött, 800g",
      price: 69.90,
      original_price: 89.90,
      comparison_price: "87.38 kr/kg",
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      offer_details: "Veckans erbjudande",
      quantity_info: "800g",
      is_member_price: false,
      store: store,
      store_location: null
    },
    {
      name: "Karré Skivad",
      description: "Scan, 300g",
      price: 29.90,
      original_price: 39.90,
      comparison_price: "99.67 kr/kg",
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      offer_details: "Veckans erbjudande",
      quantity_info: "300g",
      is_member_price: false,
      store: store,
      store_location: null
    },
    {
      name: "Smörgåsgurka",
      description: "Felix, 375g",
      price: 19.90,
      original_price: 24.90,
      comparison_price: "53.07 kr/kg",
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      offer_details: "Veckans erbjudande",
      quantity_info: "375g",
      is_member_price: false,
      store: store,
      store_location: null
    }
  ];
}

/**
 * Extracts products using a fallback method when primary methods fail
 */
export function extractFallbackProducts(document: Document, store: string = "willys"): ExtractorResult[] {
  console.log("Attempting fallback extraction for Willys products");
  
  // Try to extract any product-like elements on the page
  const containers = document.querySelectorAll(".w-product, .product, .offer-card, [data-testid^='product']");
  console.log(`Found ${containers.length} potential product containers via fallback selectors`);
  
  if (containers.length === 0) {
    return [];
  }
  
  const products: ExtractorResult[] = [];
  
  for (const container of containers) {
    try {
      // Attempt to extract basic info
      const nameEl = container.querySelector("h2, h3, .product-name, .title");
      if (!nameEl) continue;
      
      const name = nameEl.textContent?.trim();
      if (!name) continue;
      
      // Extract price from any element that might contain it
      const priceEl = container.querySelector(".price, .current-price, [data-testid='price']");
      let price: number | null = null;
      if (priceEl) {
        const priceText = priceEl.textContent?.trim()
          .replace("kr", "")
          .replace(",-", "")
          .replace(",", ".")
          .trim();
        const parsedPrice = parseFloat(priceText || "0");
        price = isNaN(parsedPrice) ? null : parsedPrice;
      }
      
      // Extract image
      const imgEl = container.querySelector("img");
      const image_url = imgEl ? imgEl.getAttribute("src") : null;
      
      products.push({
        name,
        price,
        image_url,
        description: null,
        original_price: null,
        comparison_price: null,
        offer_details: "Veckans erbjudande",
        quantity_info: null,
        is_member_price: false,
        store: store,
        store_location: null
      });
    } catch (e) {
      console.error("Error extracting fallback product:", e);
    }
  }
  
  console.log(`Extracted ${products.length} products with fallback method`);
  return products;
}
