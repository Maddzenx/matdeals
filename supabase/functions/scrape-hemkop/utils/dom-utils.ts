
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Function to fetch HTML content with multiple retry strategies
export async function fetchHtmlContent(
  urls: string[], 
  userAgents: string[], 
  forceRefresh: boolean = false
): Promise<{document: Document | null, html: string, fetchSuccess: boolean}> {
  let html = '';
  let fetchSuccess = false;
  let document = null;
  
  for (const url of urls) {
    for (const userAgent of userAgents) {
      try {
        console.log(`Fetching from: ${url} with User-Agent: ${userAgent.substring(0, 20)}...`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=0',
            'Pragma': forceRefresh ? 'no-cache' : '',
            'Referer': 'https://www.hemkop.se/' // Adding referer to appear more like a browser
          },
          redirect: 'follow'
        });
        
        if (response.ok) {
          html = await response.text();
          console.log(`Successfully fetched from ${url}, received ${html.length} characters`);
          
          // Log the first 500 characters to see what we're getting
          console.log(`Preview of HTML: ${html.substring(0, 500)}...`);
          
          // If we got a valid HTML response, parse it
          if (html.length > 1000 && html.includes('</html>')) {
            // Parse the HTML
            const parser = new DOMParser();
            document = parser.parseFromString(html, "text/html");
            
            if (document) {
              console.log("Successfully parsed HTML document");
              
              // Check if we can find any product elements to confirm this is a useful page
              // Using a wider range of selectors to catch various product layouts
              const productElements = document.querySelectorAll(
                '.product, .product-card, [class*="product"], article, .offer, .campaign-item, ' +
                '.price-card, .offer-card, .item, .goods, .product-item, .discount-item'
              );
              console.log(`Found ${productElements.length} potential product elements`);
              
              if (productElements.length > 0) {
                fetchSuccess = true;
                break;
              } else {
                console.log("No product elements found on this page, trying next selector approach");
                
                // Try to find any elements with price-related content
                const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"], [class*="kr"], [class*="erbjudande"]');
                console.log(`Found ${priceElements.length} potential price elements`);
                
                if (priceElements.length > 5) { // If we find multiple price elements, it's likely a product page
                  fetchSuccess = true;
                  break;
                }
              }
            }
          } else {
            console.log("HTML response too short or invalid");
          }
        } else {
          console.log(`Failed to fetch from ${url} with status: ${response.status}`);
        }
      } catch (fetchError) {
        console.error(`Error fetching from ${url} with User-Agent ${userAgent.substring(0, 20)}:`, fetchError);
      }
    }
    
    if (fetchSuccess && document) {
      break;
    }
  }
  
  return { document, html, fetchSuccess };
}
