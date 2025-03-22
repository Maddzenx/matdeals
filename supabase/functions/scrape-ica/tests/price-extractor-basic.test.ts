
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { createTestElement, assertEquals, assert } from "./test-utils.ts";

// Basic tests for extractProductPrice
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
