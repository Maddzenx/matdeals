
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { findOfferContainers, findAllOfferCards } from "./dom-utils.ts";
import { assertEquals } from "https://deno.land/std@0.195.0/testing/asserts.ts";

// Helper function to create a test document
function createTestDocument(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html")!;
}

// Tests for findOfferContainers
Deno.test("findOfferContainers - should find containers with primary selectors", () => {
  const html = `
    <html>
      <body>
        <div class="view--promotion-list">Container 1</div>
        <div class="sv-row-promotional__offers">Container 2</div>
      </body>
    </html>
  `;
  
  const document = createTestDocument(html);
  const containers = findOfferContainers(document);
  
  assertEquals(containers.length, 2);
});

Deno.test("findOfferContainers - should find containers with fallback selectors", () => {
  const html = `
    <html>
      <body>
        <div class="some-promotional-class">Container 1</div>
        <div class="some-offer-class">Container 2</div>
      </body>
    </html>
  `;
  
  const document = createTestDocument(html);
  const containers = findOfferContainers(document);
  
  assertEquals(containers.length, 2);
});

// Tests for findAllOfferCards
Deno.test("findAllOfferCards - should find cards with direct selectors", () => {
  const html = `
    <html>
      <body>
        <article class="offer-card">Card 1</article>
        <div class="offer-card-v3">Card 2</div>
      </body>
    </html>
  `;
  
  const document = createTestDocument(html);
  const containers: Element[] = [];
  const cards = findAllOfferCards(document, containers);
  
  assertEquals(cards.length, 2);
});

Deno.test("findAllOfferCards - should find cards within containers", () => {
  const html = `
    <html>
      <body>
        <div class="promotion-container">
          <article>Card 1</article>
          <article>Card 2</article>
        </div>
      </body>
    </html>
  `;
  
  const document = createTestDocument(html);
  const containers = document.querySelectorAll(".promotion-container");
  const cards = findAllOfferCards(document, [...containers]);
  
  assertEquals(cards.length, 2);
});

Deno.test("findAllOfferCards - should use fallback strategy for finding cards", () => {
  const html = `
    <html>
      <body>
        <section>
          <h2>Erbjudanden</h2>
          <div class="items">
            <div class="item">Card 1</div>
            <div class="item">Card 2</div>
          </div>
        </section>
      </body>
    </html>
  `;
  
  const document = createTestDocument(html);
  const containers: Element[] = [];
  const cards = findAllOfferCards(document, containers);
  
  // This test verifies the broader fallback strategy works
  // It should find at least the two item cards
  assertEquals(cards.length >= 2, true);
});
