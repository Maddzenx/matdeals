
import { extractProductName } from "../extractors/name-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Tests for extractProductName
Deno.test("extractProductName - should extract name with primary selectors", () => {
  const html = `<div>
    <p class="offer-card__title">Test Product</p>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductName(element);
  
  assertEquals(result, "Test Product");
});

Deno.test("extractProductName - should extract name with fallback selectors", () => {
  const html = `<div>
    <h3>Test Product</h3>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductName(element);
  
  assertEquals(result, "Test Product");
});

Deno.test("extractProductName - should return null for empty element", () => {
  const html = `<div></div>`;
  
  const element = createTestElement(html);
  const result = extractProductName(element);
  
  assertEquals(result, null);
});
