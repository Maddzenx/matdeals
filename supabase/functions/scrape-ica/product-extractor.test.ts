
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { extractProductName } from "./extractors/name-extractor.ts";
import { extractProductDescription } from "./extractors/description-extractor.ts";
import { extractProductPrice } from "./extractors/price-extractor.ts";
import { extractProductImageUrl } from "./extractors/image-extractor.ts";
import { processProductCard } from "./processors/card-processor.ts";
import { extractProducts } from "./products-extractor.ts";

// Helper function to create test HTML elements
function createTestElement(html: string): Element {
  const parser = new DOMParser();
  const document = parser.parseFromString(`<div>${html}</div>`, "text/html");
  return document!.querySelector("div")!;
}

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

// Tests for extractProductPrice
Deno.test("extractProductPrice - should extract price with primary selectors", () => {
  const html = `<div>
    <div class="price-splash__text">
      <span class="price-splash__text__firstValue">25.90</span>
    </div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assert(result.priceStr !== null);
});

Deno.test("extractProductPrice - should extract price with simple formats", () => {
  const html = `<div>
    <div class="price">25:-</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25);
  assert(result.priceStr !== null);
});

Deno.test("extractProductPrice - should extract price with comma format", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assert(result.priceStr !== null);
});

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

// Test for processProductCard
Deno.test("processProductCard - should process a complete product card", () => {
  const html = `<div>
    <h3>Test Product</h3>
    <p>Test Description</p>
    <div class="price">25,90 kr</div>
    <img src="test.jpg">
  </div>`;
  
  const element = createTestElement(html);
  const processedNames = new Set<string>();
  const result = processProductCard(element, "https://example.com/", processedNames);
  
  assertNotEquals(result, null);
  assertEquals(result?.name, "Test Product");
  assertEquals(result?.description, "Test Description");
  assertEquals(result?.price, 25.90);
  assertEquals(result?.image_url, "https://example.com/test.jpg");
});

// Import assert functions
import { assertEquals, assertNotEquals, assert } from "https://deno.land/std@0.195.0/testing/asserts.ts";
