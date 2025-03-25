
import { ExtractorResult, normalizeImageUrl, extractPrice } from "./base-extractor.ts";
import { extractName } from "./name-extractor.ts";

/**
 * Extract products from the weekly offers section
 */
export function extractFromWeeklyOffers(document: Document, baseUrl: string): ExtractorResult[] {
  console.log("Looking for weekly offers section in the HTML");
  
  try {
    // Common selectors for weekly offer sections
    const offerSectionSelectors = [
      '.weekly-offers', '.offers-section', '.campaign-section',
      '[class*="offer-section"]', '[class*="campaign"]',
      '[data-testid="offer-section"]', '[data-testid="campaign-section"]'
    ];
    
    // Find the weekly offers section
    let weeklyOffersSection: Element | null = null;
    
    for (const selector of offerSectionSelectors) {
      const section = document.querySelector(selector);
      if (section) {
        console.log(`Found weekly offers section with selector: ${selector}`);
        weeklyOffersSection = section;
        break;
      }
    }
    
    if (!weeklyOffersSection) {
      console.log("No weekly offers section found, trying alternative selectors");
      
      // Try to find any container with offers/campaigns
      const alternativeSectionSelectors = [
        'section', '.container', '.products-container',
        '[class*="products"]', '[class*="offers"]', '[class*="weekly"]'
      ];
      
      for (const selector of alternativeSectionSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('erbjudande') || text.includes('kampanj') || text.includes('rea') || text.includes('rabatt')) {
            console.log(`Found alternative weekly offers section with selector: ${selector}`);
            weeklyOffersSection = element;
            break;
          }
        }
        if (weeklyOffersSection) break;
      }
      
      if (!weeklyOffersSection) {
        console.log("No weekly offers section found");
        return [];
      }
    }
    
    // Look for product cards within the offers section
    const productCardSelectors = [
      '.product-card', '.card', '.offer-item', '.campaign-item',
      '[class*="product-card"]', '[class*="offer-item"]', '[class*="campaign-item"]',
      'li', 'article', '.item'
    ];
    
    // Find product cards
    let productCards: NodeListOf<Element> | null = null;
    
    for (const selector of productCardSelectors) {
      const cards = weeklyOffersSection.querySelectorAll(selector);
      if (cards && cards.length > 0) {
        console.log(`Found ${cards.length} product cards with selector: ${selector}`);
        productCards = cards;
        break;
      }
    }
    
    if (!productCards || productCards.length === 0) {
      console.log("No product cards found in weekly offers section");
      return [];
    }
    
    console.log(`Processing ${productCards.length} product cards from weekly offers`);
    
    // Extract product information from each card
    const products: ExtractorResult[] = [];
    
    for (const card of productCards) {
      try {
        // 1. Name
        let name = extractName(card);
        
        if (!name) {
          console.log("Skipping card - could not find product name");
          continue;
        }
        
        console.log(`Processing product card: ${name}`);
        
        // 2. Price - modified to ensure we get integer values
        let price = null;
        const priceElements = card.querySelectorAll('[class*="price"], [class*="Price"], .pris, .discount');
        
        for (const el of priceElements) {
          const priceText = el.textContent?.trim();
          if (priceText && priceText.match(/\d+/)) {
            const extractedPrice = extractPrice(priceText);
            if (extractedPrice !== null) {
              // Convert to integer to match database type
              price = Math.round(extractedPrice);
              break;
            }
          }
        }
        
        if (price === null) {
          const allText = card.textContent || '';
          const priceMatches = allText.match(/(\d+)[\s:,.]?(\d*)\s*kr/);
          
          if (priceMatches) {
            const mainNumber = parseInt(priceMatches[1]);
            const decimal = priceMatches[2] ? parseInt(priceMatches[2]) : 0;
            
            // Ensure price is an integer
            if (decimal > 0) {
              const combinedPrice = parseFloat(`${mainNumber}.${decimal}`);
              price = Math.round(combinedPrice);
            } else {
              price = mainNumber;
            }
          }
        }
        
        // 3. Image
        let imageUrl = '';
        const images = card.querySelectorAll('img');
        
        for (const img of images) {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && !src.includes('logo') && !src.includes('icon')) {
            imageUrl = normalizeImageUrl(src, baseUrl);
            break;
          }
        }
        
        // 4. Description
        let description = '';
        const descElements = card.querySelectorAll('[class*="desc"], [class*="info"], [class*="details"], p');
        
        for (const el of descElements) {
          const text = el.textContent?.trim();
          if (text && text !== name && text.length > 5 && !text.match(/\d+[\s:,.]?\d*\s*kr/) && !el.querySelector('img')) {
            description = text;
            break;
          }
        }
        
        // 5. Offer details
        let offerDetails = '';
        const offerElements = card.querySelectorAll('[class*="campaign"], [class*="offer"], [class*="saving"], [class*="discount"]');
        
        for (const el of offerElements) {
          const text = el.textContent?.trim();
          if (text && text.length > 2 && text !== name && text !== description) {
            offerDetails = text;
            break;
          }
        }
        
        if (!offerDetails) {
          offerDetails = 'Veckans erbjudande';
        }
        
        // Add product to list
        if (name && price !== null) {
          products.push({
            name,
            price,
            description: description || null,
            image_url: imageUrl || 'https://assets.icanet.se/t_product_large_v1,f_auto/7300156501245.jpg',
            offer_details: offerDetails,
            store: 'willys'
          });
          
          console.log(`Added weekly offer: ${name}, price: ${price}`);
        }
      } catch (cardError) {
        console.error("Error processing product card:", cardError);
      }
    }
    
    console.log(`Successfully extracted ${products.length} weekly offers`);
    return products;
  } catch (error) {
    console.error("Error extracting weekly offers:", error);
    return [];
  }
}
