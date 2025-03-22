
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { assertEquals, assertNotEquals, assert } from "https://deno.land/std@0.195.0/testing/asserts.ts";

// Helper function to create test HTML elements
export function createTestElement(html: string): Element {
  const parser = new DOMParser();
  const document = parser.parseFromString(`<div>${html}</div>`, "text/html");
  return document!.querySelector("div")!;
}

// Export assert functions for use in test files
export { assertEquals, assertNotEquals, assert };
