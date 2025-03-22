
import { processProductCard } from "../processors/card-processor.ts";
import { createTestElement, assertEquals, assertNotEquals } from "./test-utils.ts";

// Test for processProductCard
Deno.test("processProductCard - should process a complete product card", () => {
  const html = `<div>
    <h3>Test Product</h3>
    <p>Test Description</p>
    <div class="price">25,90 kr</div>
    <img src="test.jpg">
    <div class="comparison-price">259,00 kr/kg</div>
    <div class="offer-details">2 för 45 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const processedNames = new Set<string>();
  const result = processProductCard(element, "https://example.com/", processedNames);
  
  assertNotEquals(result, null);
  assertEquals(result?.name, "Test Product");
  assertEquals(result?.description, "Test Description");
  assertEquals(result?.price, 25.90);
  assertEquals(result?.image_url, "https://example.com/test.jpg");
  assertEquals(result?.comparison_price, "259,00 kr/kg");
  assertEquals(result?.offer_details, "2 för 45 kr");
});
