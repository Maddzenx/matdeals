
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // URL of the webpage to scrape
    const url = 'https://www.ica.se/erbjudanden/ica-kvantum-sannegarden-1004293/';

    console.log("Fetching ICA website data from:", url);
    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch with status: ${response.status}`);
    }
    
    const html = await response.text();

    // Parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }

    // Extract all possible containers that might contain product offers
    // Try multiple different selectors to capture all types of product cards
    const offerContainers = [
      ...document.querySelectorAll('.view--promotion-list'),
      ...document.querySelectorAll('.sv-row-promotional__offers'),
      ...document.querySelectorAll('.sv-text-promotional__block'),
      ...document.querySelectorAll('.promotion__list')
    ];
    
    console.log(`Found ${offerContainers.length} offer containers to process`);
    
    // Looking for all offer containers which might contain multiple formats of offer cards
    let offerCards = [
      ...document.querySelectorAll('article.offer-card'),
      ...document.querySelectorAll('.offer-card-v3'),
      ...document.querySelectorAll('.offer-card-banner'),
      ...document.querySelectorAll('.product-card'),
      ...document.querySelectorAll('.offer-card__container'),
      ...document.querySelectorAll('.promotion-item'),
      ...document.querySelectorAll('.offer-list__item')
    ];
    
    // If no cards found directly, try to find them within the containers
    if (offerCards.length === 0 && offerContainers.length > 0) {
      for (const container of offerContainers) {
        offerCards = [
          ...offerCards,
          ...container.querySelectorAll('article'),
          ...container.querySelectorAll('.offer-card'),
          ...container.querySelectorAll('.product-card'),
          ...container.querySelectorAll('.offer-card-v3'),
          ...container.querySelectorAll('.promotion-item')
        ];
      }
    }
    
    console.log(`Found ${offerCards.length} offer elements to process`);

    // If still no offers found, try a more general approach
    if (offerCards.length === 0) {
      // Look for any elements that might contain offer information
      const possibleOfferElements = document.querySelectorAll('article, .card, [class*="offer"], [class*="product"], [class*="promotion"]');
      console.log(`Trying broader selector, found ${possibleOfferElements.length} possible elements`);
      offerCards = [...possibleOfferElements];
    }

    const products = [];

    // Process each offer card
    for (const card of offerCards) {
      try {
        // Extract product name using multiple possible selectors
        let name = null;
        const nameSelectors = [
          'p.offer-card__title', '.offer-card-v3__title', '.product-card__product-name', 
          '.promotion-item__title', 'h2', 'h3', '.title', '[class*="title"]',
          '[class*="name"]', '.offer-card__heading'
        ];
        
        for (const selector of nameSelectors) {
          const element = card.querySelector(selector);
          if (element && element.textContent.trim()) {
            name = element.textContent.trim();
            break;
          }
        }
        
        // If still no name, try to find any text that might be a product name
        if (!name) {
          const possibleNameElements = card.querySelectorAll('p, h1, h2, h3, h4, .text-title, [class*="title"], [class*="name"]');
          for (const element of possibleNameElements) {
            const text = element.textContent.trim();
            if (text && text.length > 3 && text.length < 100) {
              name = text;
              break;
            }
          }
        }
        
        // Extract product description using multiple possible selectors
        let description = null;
        const descSelectors = [
          'p.offer-card__text', '.offer-card-v3__description', '.product-card__product-subtitle',
          '.promotion-item__description', '.details', '.description', '[class*="description"]', 
          '[class*="subtitle"]', '[class*="text"]', '.offer-card__preamble'
        ];
        
        for (const selector of descSelectors) {
          const element = card.querySelector(selector);
          if (element && element.textContent.trim()) {
            description = element.textContent.trim();
            break;
          }
        }
        
        // Extract product price
        let price = null;
        let priceStr = null;
        
        // Try multiple price element selectors
        const priceSelectors = [
          'div.price-splash__text', '.product-price', '.offer-card-v3__price-value',
          '.price-standard__value', '.price', '[class*="price"]', '.promotion-item__price',
          '.offer-card__price'
        ];
        
        for (const selector of priceSelectors) {
          const element = card.querySelector(selector);
          if (element) {
            // Look for specific price value within the price element
            const valueElement = element.querySelector('span.price-splash__text__firstValue') || 
                                 element.querySelector('.price-standard__value') ||
                                 element;
                                 
            if (valueElement) {
              priceStr = valueElement.textContent.trim();
              // Extract numeric part of the price, removing non-numeric characters except decimal point
              const numericPrice = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
              price = numericPrice ? parseFloat(numericPrice) : null;
              break;
            }
          }
        }
        
        // If still no price found, try to find any text that looks like a price
        if (!price) {
          const allTexts = [];
          const textNodes = card.querySelectorAll('*');
          textNodes.forEach(node => {
            if (node.textContent) {
              allTexts.push(node.textContent.trim());
            }
          });
          
          for (const text of allTexts) {
            // Look for patterns like "25:-", "25.90:-", "25,90 kr", etc.
            const priceMatches = text.match(/(\d+[.,]?\d*)(?:\s*(?::-|kr|SEK|:-\s*kr))/i);
            if (priceMatches && priceMatches[1]) {
              priceStr = text;
              price = parseFloat(priceMatches[1].replace(',', '.'));
              break;
            }
          }
        }
        
        // Extract product image URL
        let imageUrl = null;
        const imageSelectors = [
          'img.offer-card__image-inner', '.product-image img', '.product-card__product-image img',
          '.offer-card-v3__image', 'img', '[class*="image"] img', '.promotion-item__image img'
        ];
        
        for (const selector of imageSelectors) {
          const element = card.querySelector(selector);
          if (element) {
            imageUrl = element.getAttribute('src') || element.getAttribute('data-src');
            
            // Make sure the URL is absolute
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = new URL(imageUrl, url).href;
            }
            
            if (imageUrl) break;
          }
        }
        
        // If we at least have a name, consider it a valid product
        if (name) {
          products.push({
            name,
            description,
            price,
            image_url: imageUrl
          });
          
          console.log(`Processed product: ${name} with price: ${price || 'unknown'} (${priceStr || 'no price found'})`);
        }
      } catch (cardError) {
        console.error("Error processing a card:", cardError);
        // Continue with the next card even if one fails
      }
    }

    console.log(`Successfully processed ${products.length} products out of ${offerCards.length} elements`);

    if (products.length === 0) {
      console.error("No products were found. HTML structure might have changed.");
      throw new Error("No products found on the page. The website structure may have changed.");
    }

    // Clear all existing products first
    console.log("Clearing all existing ICA products...");
    const { error: deleteError } = await supabase
      .from('ICA')
      .delete()
      .neq('name', ''); // Delete all rows
    
    if (deleteError) {
      console.error("Error clearing existing products:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully cleared existing products. Inserting new products...");

    // Insert all new products
    const { error: insertError } = await supabase
      .from('ICA')
      .insert(products);
    
    if (insertError) {
      console.error("Error inserting new products:", insertError);
      throw insertError;
    }
    
    console.log(`Successfully inserted ${products.length} new products`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed all products from ICA website. Inserted ${products.length} new offers.`,
        products
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error scraping ICA website:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
