
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Tests for original price, comparison price and offer details extraction variations
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
