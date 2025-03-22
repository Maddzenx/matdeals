
import { extractProductPrice } from "../extractors/price-extractor.ts";
import { extractOfferDetails } from "../extractors/offer-details-extractor.ts";
import { createTestElement, assertEquals } from "./test-utils.ts";

// Tests for offer details extraction
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

// Tests for offer details extraction via price extractor
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

// Tests for member price detection
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
