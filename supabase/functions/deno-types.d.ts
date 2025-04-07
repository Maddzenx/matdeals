
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
  }
  
  export interface Element {
    querySelector(selector: string): Element | null;
    querySelectorAll(selector: string): NodeListOf<Element>;
    getAttribute(name: string): string | null;
    textContent: string | null;
    innerHTML: string;
    tagName: string;
  }
  
  export interface NodeListOf<T> {
    length: number;
    item(index: number): T | null;
    [index: number]: T;
    forEach(callbackfn: (value: T, key: number, parent: NodeListOf<T>) => void): void;
  }
}

declare module "https://deno.land/std@0.195.0/testing/asserts.ts" {
  export function assertEquals(actual: any, expected: any, msg?: string): void;
  export function assertStringIncludes(actual: string, expected: string, msg?: string): void;
  export function assertNotEquals(actual: any, expected: any, msg?: string): void;
}

declare module "https://deno.land/std@0.195.0/testing/mod.ts" {
  export function test(name: string, fn: () => void | Promise<void>): void;
}

declare module "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts" {
  export * from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
}

// Declare any missing modules used in edge functions
declare module "./product-extractor.ts" {
  export const extractProducts: any;
}

declare module "./scrapers/coop-scraper.ts" {
  export const scrapeCoopRecipes: any;
}

declare module "./scrapers/ica-scraper.ts" {
  export const scrapeIcaRecipes: any;
}

declare module "./mock/mock-recipes.ts" {
  export const mockRecipes: any;
}

declare module "../extractors/name-extractor.ts" {
  export const extractProductName: any;
}

declare module "../extractors/price-extractor.ts" {
  export const extractProductPrice: any;
}
