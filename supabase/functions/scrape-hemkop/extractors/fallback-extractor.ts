
import { ExtractorResult } from "./base-extractor.ts";

// Extract products from fallback mechanisms when regular extraction fails
export function extractFallbackProducts(document: Document): ExtractorResult[] {
  console.log("Using fallback extraction methods");
  
  const products: ExtractorResult[] = [];
  
  // Try to find any elements that might contain product information
  const possibleProductContainers = document.querySelectorAll(
    'article, .product, .item, .offer, [class*="product"], [class*="offer"], .card'
  );
  
  console.log(`Found ${possibleProductContainers.length} possible product containers with fallback selectors`);
  
  for (const container of possibleProductContainers) {
    try {
      // Look for any text that seems like a product name
      const nameElement = container.querySelector('h2, h3, h4, .title, [class*="title"], [class*="name"]');
      
      if (!nameElement || !nameElement.textContent) continue;
      
      const name = nameElement.textContent.trim();
      if (!name || name.length < 3) continue;
      
      // Look for price
      const priceElement = container.querySelector('.price, [class*="price"], [class*="cost"], strong');
      const price = priceElement ? extractPriceFromText(priceElement.textContent || '') : null;
      
      // Look for image
      const imgElement = container.querySelector('img');
      const imageUrl = imgElement ? imgElement.getAttribute('src') || DEFAULT_IMAGE_URL : DEFAULT_IMAGE_URL;
      
      // Look for description
      const descElement = container.querySelector('.description, [class*="desc"], p');
      const description = descElement ? descElement.textContent?.trim() || null : null;
      
      products.push({
        name,
        price,
        description,
        image_url: imageUrl,
        offer_details: 'Erbjudande' // Default offer text
      });
    } catch (error) {
      console.error('Error in fallback extraction for item:', error);
    }
  }
  
  console.log(`Extracted ${products.length} products using fallback method`);
  
  return products;
}

// Create sample products for when all extraction methods fail
export function createSampleProducts(): ExtractorResult[] {
  return [
    {
      name: "Färsk Kycklingfilé",
      price: 79,
      description: "Hemköp. 900-1000 g. Jämförpris 79:90/kg",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Frukostbröd",
      price: 22,
      description: "Skogaholm. 500g. Jämförpris 44:-/kg",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7311070362291.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Färsk Laxfilé",
      price: 129,
      description: "Fisk från havet. 400 g. Jämförpris 322:50/kg",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7313630100015.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Färska Svenska Äpplen",
      price: 25,
      description: "Klass 1. Ca 700g. Jämförpris 35:71/kg",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/4038838117829.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Kaffe Mellanrost",
      price: 49,
      description: "Gevalia. 450 g. Jämförpris 108:89/kg",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/8711000530092.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Färska Jordgubbar",
      price: 25,
      description: "Svenska. Klass 1. 250g ask. Jämförpris 100:-/kg",
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7330671021981.jpg",
      offer_details: "Veckans erbjudande"
    }
  ];
}

// Helper utility function
function extractPriceFromText(text: string): number | null {
  if (!text) return null;
  
  // Look for numbers with Swedish price format: 29:90, 29,90, 29.90, or just 29
  const priceMatch = text.match(/(\d+)[,.:]?(\d*)/);
  if (!priceMatch) return null;
  
  const wholePart = parseInt(priceMatch[1]);
  
  // If we have decimal part
  if (priceMatch[2] && priceMatch[2].length > 0) {
    const decimalPart = parseInt(priceMatch[2]);
    return decimalPart > 0 ? parseFloat(`${wholePart}.${decimalPart}`) : wholePart;
  }
  
  return wholePart;
}

// Define default image URL
const DEFAULT_IMAGE_URL = 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg';
