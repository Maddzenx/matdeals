
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Complex tests for extractProductPrice
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
