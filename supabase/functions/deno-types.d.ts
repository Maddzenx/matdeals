
// This file provides type declarations for Deno modules to satisfy TypeScript
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@*" {
  export * from "@supabase/supabase-js";
}

declare module "https://deno.land/x/deno_dom/deno-dom-wasm.ts" {
  export class DOMParser {
    parseFromString(html: string, type: string): Document;
  }
  
  export interface Document {
    querySelector(selector: string): Element | null;
    querySelectorAll(selector: string): NodeListOf<Element>;
    [key: string]: any; // Allow any other properties
  }
  
  export interface Element {
    querySelector(selector: string): Element | null;
    querySelectorAll(selector: string): NodeListOf<Element>;
    getAttribute(name: string): string | null;
    textContent: string | null;
    innerHTML: string;
    tagName: string;
    [key: string]: any; // Allow any other properties
  }
  
  export interface NodeListOf<T> {
    length: number;
    item(index: number): T | null;
    [index: number]: T;
    forEach(callbackfn: (value: T, key: number, parent: NodeListOf<T>) => void): void;
    [Symbol.iterator](): Iterator<T>; // Add iterator method
  }
}

declare module "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts" {
  export * from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
}

declare module "https://deno.land/std@0.195.0/testing/asserts.ts" {
  export function assertEquals(actual: any, expected: any, msg?: string): void;
  export function assertStringIncludes(actual: string, expected: string, msg?: string): void;
  export function assertNotEquals(actual: any, expected: any, msg?: string): void;
  export function assert(condition: boolean, msg?: string): void;
  export function assertThrows(fn: () => void, ErrorClass?: new (...args: any[]) => Error, msgIncludes?: string, msg?: string): Error;
}

declare module "https://deno.land/std@0.195.0/testing/mod.ts" {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export const runTests: any;
}

// Fix for the extractProductName and extractProductPrice exports
declare module "../extractors/name-extractor.ts" {
  export function extractProductName(element: any): string | null;
  export default function extractProductName(element: any): string | null;
}

declare module "../extractors/price-extractor.ts" {
  export function extractProductPrice(element: any): any;
  export default function extractProductPrice(element: any): any;
}

// Fix for import in scrape-ica/supabase-client.test.ts
declare module "./product-extractor.ts" {
  export const extractProducts: any;
}

// Declare exported members for scrape-recipes modules
declare module "./scrapers/coop-scraper.ts" {
  export const scrapeCoopRecipes: any;
}

declare module "./scrapers/ica-scraper.ts" {
  export const scrapeIcaRecipes: any;
}

declare module "./mock/mock-recipes.ts" {
  export const mockRecipes: any;
}

// Define the ExtractorResult type to fix issues in scrape-willys
interface ExtractorResult {
  name: string;
  price: string | number;
  description?: string | null;
  image_url?: string;
  original_price?: string | number | null;
  comparison_price?: string | null;
  quantity_info?: string | null;
  is_member_price?: boolean;
  offer_details?: string;
  store?: string;
  store_location?: string;
  store_name?: string;
  index?: number;
  "Product Name"?: string;
  "Brand and Weight"?: string;
  "Price"?: number | string;
  "Product Image"?: string;
  "Product Link"?: string;
  "Label 1"?: string;
  "Label 2"?: string;
  "Label 3"?: string;
  "Savings"?: number;
  "Unit Price"?: string;
  "Purchase Limit"?: string;
  "Position"?: number;
}
