
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Edge case tests for price extraction
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
