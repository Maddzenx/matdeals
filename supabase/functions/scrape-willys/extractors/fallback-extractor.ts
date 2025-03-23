
import { ExtractorResult } from "./base-extractor.ts";

/**
 * Creates sample products when no products can be extracted from the page
 */
export function createSampleProducts(storeName: string = "willys johanneberg"): ExtractorResult[] {
  console.log(`Creating sample products for ${storeName}`);
  
  // Sample products with Willys-style formatting
  return [
    {
      name: "Äpple Royal Gala",
      description: "Willys, Italien, Klass 1",
      price: 24.90,
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      original_price: "29.90",
      offer_details: "Johanneberg erbjudande",
      store: storeName
    },
    {
      name: "Färsk Kycklingfilé",
      description: "Kronfågel, Sverige, 700-925g",
      price: 89.90,
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      original_price: "109.90",
      offer_details: "Johanneberg erbjudande",
      store: storeName
    },
    {
      name: "Kavli Mjukost",
      description: "Willys, Flera smaker, 275g",
      price: 29.90,
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      original_price: "34.90",
      offer_details: "Johanneberg erbjudande",
      store: storeName
    },
    {
      name: "Nötfärs 12%",
      description: "Svenskt Butikskött, 800g",
      price: 69.90,
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      original_price: "89.90",
      offer_details: "Johanneberg erbjudande",
      store: storeName
    },
    {
      name: "Karré Skivad",
      description: "Scan, 300g",
      price: 29.90,
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      original_price: "39.90",
      offer_details: "Johanneberg erbjudande",
      store: storeName
    },
    {
      name: "Smörgåsgurka",
      description: "Felix, 375g",
      price: 19.90,
      image_url: "https://assets.icanet.se/e_sharpen:100,q_auto,dpr_1.25,w_718,h_718,c_lfill/imagevaultfiles/id_226367/cf_259/morotter_i_knippe.jpg",
      original_price: "24.90",
      offer_details: "Johanneberg erbjudande",
      store: storeName
    }
  ];
}

/**
 * Extracts products using a fallback method when primary methods fail
 */
export function extractFallbackProducts(document: Document, storeName: string = "willys johanneberg"): ExtractorResult[] {
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
      let price = null;
      if (priceEl) {
        const priceText = priceEl.textContent?.trim()
          .replace("kr", "")
          .replace(",-", "")
          .replace(",", ".")
          .trim();
        price = parseFloat(priceText || "0") || null;
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
        offer_details: "Johanneberg erbjudande",
        store: storeName
      });
    } catch (e) {
      console.error("Error extracting fallback product:", e);
    }
  }
  
  console.log(`Extracted ${products.length} products with fallback method`);
  return products;
}
