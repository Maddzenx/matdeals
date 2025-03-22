
import { extractProductDescription } from "../extractors/description-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Tests for extractProductDescription
Deno.test("extractProductDescription - should extract description with primary selectors", () => {
  const html = `<div>
    <p class="offer-card__text">Test Description</p>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductDescription(element, "Test Product");
  
  assertEquals(result, "Test Description");
});

Deno.test("extractProductDescription - should extract description with fallback selectors", () => {
  const html = `<div>
    <div class="description">Test Description</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductDescription(element, "Test Product");
  
  assertEquals(result, "Test Description");
});
