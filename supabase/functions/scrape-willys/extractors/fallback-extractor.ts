
import { ExtractorResult, normalizeImageUrl, extractPrice } from './base-extractor.ts';

export function extractFallbackProducts(document: Document): ExtractorResult[] {
  console.log("Trying strategy 4: Generic fallback selectors");
  const products: ExtractorResult[] = [];
  const processedProductNames = new Set<string>();
  
  // If all else failed, try a last-ditch effort to parse the document for any text content that might be products
  const allElements = document.querySelectorAll('*');
  let potentialProducts = [];
  
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    const text = element.textContent?.trim();
    
    if (text && text.length > 5 && text.length < 50 && /^\D+\s+\d+[\s,:.]?\d*\s*(kr|:-)/i.test(text)) {
      potentialProducts.push({ element, text });
    }
  }
  
  console.log(`Found ${potentialProducts.length} potential product text elements`);
  
  // Process unique potential products
  for (const { text } of potentialProducts) {
    const namePriceMatch = text.match(/^(.+?)\s+(\d+[\s,:.]?\d*)\s*(kr|:-)/i);
    
    if (namePriceMatch) {
      const name = namePriceMatch[1].trim();
      const priceText = namePriceMatch[2];
      
      if (!processedProductNames.has(name.toLowerCase())) {
        processedProductNames.add(name.toLowerCase());
        
        // Extract numeric price
        const price = extractPrice(priceText);
        
        products.push({
          name,
          price: price || 99, // Fallback price
          description: name,
          image_url: 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg', // Default image
          offer_details: "Erbjudande"
        });
        
        console.log(`Extracted product using strategy 4: ${name} with price: ${price}`);
      }
    }
  }
  
  return products;
}

export function createSampleProducts(): ExtractorResult[] {
  return [
    {
      name: "Kycklingfilé",
      description: "Kronfågel. 900-1000 g. Jämförpris 79:90/kg",
      price: 79,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Laxfilé",
      description: "Fiskeriet. 400 g. Jämförpris 149:75/kg",
      price: 59,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7313630100015.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Äpplen Royal Gala",
      description: "Italien. Klass 1. Jämförpris 24:95/kg",
      price: 24,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/4038838117829.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Färsk pasta",
      description: "Findus. 400 g. Jämförpris 62:38/kg",
      price: 25,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/7310500144511.jpg",
      offer_details: "Veckans erbjudande"
    },
    {
      name: "Kaffe",
      description: "Gevalia. 450 g. Jämförpris 119:89/kg",
      price: 49,
      image_url: "https://assets.icanet.se/t_product_large_v1,f_auto/8711000530092.jpg",
      offer_details: "Veckans erbjudande"
    }
  ];
}
