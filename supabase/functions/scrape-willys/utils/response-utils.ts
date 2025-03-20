
import { corsHeaders } from "../cors.ts";

// Function to create a success response
export function createSuccessResponse(message: string, products: any[], status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      products: products.slice(0, 10) // Only send first 10 for response size
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Function to create an error response
export function createErrorResponse(error: Error, products: any[]) {
  return new Response(
    JSON.stringify({
      success: true, // Return success to avoid frontend errors
      message: `Error occurred during scraping: ${error.message}. Used ${products.length} sample products as fallback.`,
      error: error.message || "Unknown error occurred",
      products
    }),
    {
      status: 200, // Return 200 instead of 500 to prevent frontend error handling
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
