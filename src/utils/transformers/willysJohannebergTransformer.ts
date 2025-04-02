
import { Product } from "@/data/types";

export function transformWillysJohannebergProducts(products: any[]): Product[] {
  console.log(`Transforming ${products.length} products from Willys Johanneberg`);
  
  if (!products || products.length === 0) {
    console.warn("No products to transform from Willys Johanneberg");
    return [];
  }
  
  // Log first product to see its structure
  console.log("Sample product to transform:", products[0]);
  
  return products.map((product) => {
    // Create a stable ID
    const id = product.id?.toString() || `willys-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Determine price format
    let formattedPrice = 'N/A';
    if (product.price !== null && product.price !== undefined) {
      // If price is already a string with formatting
      if (typeof product.price === 'string' && product.price.includes('kr')) {
        formattedPrice = product.price;
      } else {
        // If price is a number or needs formatting
        formattedPrice = `${product.price}:- kr`;
      }
    }
    
    return {
      id,
      name: product.name || "Unnamed Product",
      details: product.brand || product.additional_info || "Ingen beskrivning tillgänglig",
      currentPrice: formattedPrice,
      originalPrice: product.originalPrice || "",
      store: "willys",
      category: product.category || "other",
      image: product.image || "https://cdn.pixabay.com/photo/2020/10/05/19/55/grocery-5630804_1280.jpg",
      offerBadge: "Erbjudande"
    };
  });
}
