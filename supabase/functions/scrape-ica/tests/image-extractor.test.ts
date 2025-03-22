
import { extractProductImageUrl } from "../extractors/image-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Tests for extractProductImageUrl
Deno.test("extractProductImageUrl - should extract image URL with primary selectors", () => {
  const html = `<div>
    <img class="offer-card__image-inner" src="test.jpg">
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductImageUrl(element, "https://example.com/");
  
  assertEquals(result, "https://example.com/test.jpg");
});

Deno.test("extractProductImageUrl - should extract image URL with fallback selectors", () => {
  const html = `<div>
    <div class="some-container">
      <img src="test.jpg">
    </div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductImageUrl(element, "https://example.com/");
  
  assertEquals(result, "https://example.com/test.jpg");
});

Deno.test("extractProductImageUrl - should handle absolute URLs", () => {
  const html = `<div>
    <img src="https://other-domain.com/test.jpg">
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductImageUrl(element, "https://example.com/");
  
  assertEquals(result, "https://other-domain.com/test.jpg");
});
