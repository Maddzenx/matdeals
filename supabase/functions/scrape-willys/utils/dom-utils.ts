
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
            'Pragma': forceRefresh ? 'no-cache' : ''
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
              const productElements = document.querySelectorAll('.product, .product-card, [class*="product"], article');
              console.log(`Found ${productElements.length} potential product elements`);
              
              if (productElements.length > 0) {
                fetchSuccess = true;
                break;
              } else {
                console.log("No product elements found on this page, trying next URL");
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
