import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { extractProductName } from "./extractors/name-extractor.ts";
import { extractProductDescription } from "./extractors/description-extractor.ts";
import { extractProductPrice } from "./extractors/price-extractor.ts";
import { extractProductImageUrl } from "./extractors/image-extractor.ts";
import { extractOfferDetails } from "./extractors/offer-details-extractor.ts";
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

// Tests for extractProductPrice and its refactored functions
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
  assertEquals(result.originalPrice, null);
  assertEquals(result.comparisonPrice, null);
  assertEquals(result.offerDetails, null);
  assertEquals(result.isMemberPrice, false);
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

Deno.test("extractProductPrice - should extract original price", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="original-price">35,90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.originalPrice, "35,90 kr");
});

Deno.test("extractProductPrice - should extract comparison price", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="comparison-price">259,00 kr/kg</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.comparisonPrice, "259,00 kr/kg");
});

Deno.test("extractProductPrice - should extract offer details", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="offer-details">2 för 45 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.offerDetails, "2 för 45 kr");
});

Deno.test("extractProductPrice - should detect member price", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="member-price">Stammispris</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.isMemberPrice, true);
});

Deno.test("extractProductPrice - should identify complex offer patterns", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="campaign-text">Köp 3 betala för 2</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.offerDetails, "Köp 3 betala för 2");
});

Deno.test("extractProductPrice - should extract all price data together", () => {
  const html = `<div>
    <div class="price-splash__text">
      <span class="price-splash__text__firstValue">25.90</span>
    </div>
    <div class="original-price">35,90 kr</div>
    <div class="comparison-price">259,00 kr/kg</div>
    <div class="offer-details">2 för 45 kr</div>
    <div class="member-price">Stammispris</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.originalPrice, "35,90 kr");
  assertEquals(result.comparisonPrice, "259,00 kr/kg");
  assertEquals(result.offerDetails, "2 för 45 kr");
  assertEquals(result.isMemberPrice, true);
});

// Edge cases for price extraction
Deno.test("extractProductPrice - should handle empty containers", () => {
  const html = `<div></div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, null);
  assertEquals(result.priceStr, null);
  assertEquals(result.originalPrice, null);
  assertEquals(result.comparisonPrice, null);
  assertEquals(result.offerDetails, null);
  assertEquals(result.isMemberPrice, false);
});

Deno.test("extractProductPrice - should handle invalid price formats", () => {
  const html = `<div>
    <div class="price">pris</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, null);
  assertEquals(result.priceStr, null);
});

Deno.test("extractProductPrice - should extract price with unusual decimal separators", () => {
  const html = `<div>
    <div class="price">25.90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

Deno.test("extractProductPrice - should extract price when currency symbol is before the value", () => {
  const html = `<div>
    <div class="price">kr 25,90</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

Deno.test("extractProductPrice - should extract price with no decimal part", () => {
  const html = `<div>
    <div class="price">25 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25);
});

Deno.test("extractProductPrice - should extract price with unit specified", () => {
  const html = `<div>
    <div class="price">25,90 kr/st</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

Deno.test("extractProductPrice - should handle whitespace in price formatting", () => {
  const html = `<div>
    <div class="price">    25,90    kr   </div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

Deno.test("extractProductPrice - should extract price when embedded in text", () => {
  const html = `<div>
    <div class="price">Nu endast 25,90 kr!</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

Deno.test("extractProductPrice - should extract price with alternative currency notation", () => {
  const html = `<div>
    <div class="price">25,90 SEK</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

Deno.test("extractProductPrice - should prioritize first price when multiple prices exist", () => {
  const html = `<div>
    <div class="price-splash__text">
      <span class="price-splash__text__firstValue">25.90</span>
    </div>
    <div class="price">35,90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
});

// Edge cases for original price extraction
Deno.test("extractProductPrice - should extract original price with 'Ord.pris' notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Ord.pris 35,90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.originalPrice, "Ord.pris 35,90 kr");
});

Deno.test("extractProductPrice - should extract original price with 'Ordinarie' notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Ordinarie pris 35,90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.originalPrice, "Ordinarie pris 35,90 kr");
});

Deno.test("extractProductPrice - should extract original price with strikethrough formatting", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <del>35,90 kr</del>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.originalPrice, "35,90 kr");
});

// Edge cases for comparison price extraction
Deno.test("extractProductPrice - should extract comparison price with 'Jmfpris' notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Jmfpris 259,00 kr/kg</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.comparisonPrice, "Jmfpris 259,00 kr/kg");
});

Deno.test("extractProductPrice - should extract comparison price with per-unit notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">259,00 kr/kg</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.comparisonPrice, "259,00 kr/kg");
});

Deno.test("extractProductPrice - should extract comparison price with per-liter notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">259,00 kr/liter</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.comparisonPrice, "259,00 kr/liter");
});

// Edge cases for offer details extraction
Deno.test("extractProductPrice - should extract offer details with numeric patterns", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">3 för 70</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.offerDetails, "3 för 70");
});

Deno.test("extractProductPrice - should extract offer details with 'Max' limitation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Max 5 köp/hushåll</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.offerDetails, "Max 5 köp/hushåll");
});

Deno.test("extractProductPrice - should extract offer details with 'Köp' patterns", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Köp 4 betala för 3</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.offerDetails, "Köp 4 betala för 3");
});

// Edge cases for member price detection
Deno.test("extractProductPrice - should detect member price with 'Stammis' notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Stammispris</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.isMemberPrice, true);
});

Deno.test("extractProductPrice - should detect member price with 'Medlems' notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Medlemspris</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.isMemberPrice, true);
});

Deno.test("extractProductPrice - should detect member price with 'för medlemmar' notation", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
    <div class="some-class">Endast för medlemmar</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 25.90);
  assertEquals(result.isMemberPrice, true);
});

// Complex real-world cases
Deno.test("extractProductPrice - should handle complex real-world example with multiple price elements", () => {
  const html = `<div class="product-card">
    <h3>Kaffe Mellanrost</h3>
    <div class="product-price">
      <span class="current-price">29,90 kr</span>
      <span class="original-price">49,90 kr</span>
    </div>
    <div class="jmfpris">199,33 kr/kg</div>
    <div class="campaign-text">2 för 50 kr. Max 3 köp/hushåll.</div>
    <div class="member-badge">För dig som är medlem</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractProductPrice(element);
  
  assertEquals(result.price, 29.90);
  assertEquals(result.originalPrice, "49,90 kr");
  assertEquals(result.comparisonPrice, "199,33 kr/kg");
  assertEquals(result.offerDetails, "2 för 50 kr. Max 3 köp/hushåll.");
  assertEquals(result.isMemberPrice, true);
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

// Tests for extractOfferDetails
Deno.test("extractOfferDetails - should extract offer details with primary selectors", () => {
  const html = `<div>
    <div class="offer-badge">2 för 45 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractOfferDetails(element);
  
  assertEquals(result, "2 för 45 kr");
});

Deno.test("extractOfferDetails - should extract offer details with common patterns", () => {
  const html = `<div>
    <div class="some-class">2 för 30 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractOfferDetails(element);
  
  assertEquals(result, "2 för 30 kr");
});

Deno.test("extractOfferDetails - should return null when no offer details", () => {
  const html = `<div>
    <div class="price">25,90 kr</div>
  </div>`;
  
  const element = createTestElement(html);
  const result = extractOfferDetails(element);
  
  assertEquals(result, null);
});

// Import assert functions
import { assertEquals, assertNotEquals, assert } from "https://deno.land/std@0.195.0/testing/asserts.ts";
