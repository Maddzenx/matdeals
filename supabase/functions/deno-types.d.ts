
// Deno standard library modules
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "https://deno.land/std@0.195.0/testing/asserts.ts" {
  export function assertEquals(actual: unknown, expected: unknown, msg?: string): void;
  export function assertExists(actual: unknown, msg?: string): void;
  export function assert(condition: unknown, msg?: string): asserts condition;
  export function assertThrows(fn: () => void, errorClass?: any): void;
}

declare module "https://deno.land/std@0.195.0/testing/mod.ts" {
  export function runTests(options?: any): Promise<void>;
}

// Deno DOM module
declare module "https://deno.land/x/deno_dom/deno-dom-wasm.ts" {
  export class DOMParser {
    constructor();
    parseFromString(markup: string, type: string): Document;
  }
  
  // Define Document interface that's compatible with standard DOM Document
  export interface Document {
    querySelectorAll(selectors: string): NodeListOf<Element>;
    querySelector(selectors: string): Element | null;
    createElement(tagName: string): Element;
    // Add minimal properties needed
    documentElement: Element;
    body: Element;
  }
  
  // Define Element interface that's compatible with standard DOM Element
  export interface Element {
    querySelectorAll(selectors: string): NodeListOf<Element>;
    querySelector(selectors: string): Element | null;
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    textContent: string | null;
    innerHTML: string;
    tagName: string;
    className: string;
    id: string;
    classList: DOMTokenList;
    children: HTMLCollection;
    parentElement: Element | null;
    firstChild: Node | null;
    lastChild: Node | null;
  }
  
  export interface DOMTokenList {
    contains(token: string): boolean;
    add(token: string): void;
    remove(token: string): void;
    toggle(token: string): boolean;
  }
  
  export interface HTMLCollection {
    length: number;
    item(index: number): Element | null;
    [index: number]: Element;
  }
  
  export interface NodeListOf<T> extends Array<T> {
    length: number;
    item(index: number): T | null;
    [index: number]: T;
  }
  
  export interface Node {
    textContent: string | null;
    nodeName: string;
    nodeType: number;
    parentNode: Node | null;
  }
}

// Supabase module
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/@supabase/supabase-js@2.7.1" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/@supabase/supabase-js@2.38.1" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/@supabase/supabase-js@2.39.7" {
  export * from "@supabase/supabase-js";
}

// Add missing product-extractor module
declare module "./product-extractor.ts" {
  export function extractProducts(html: string): any[];
}

// Define mock scraper modules
declare module "./scrapers/coop-scraper.ts" {
  export const scrapeCoopRecipes: () => Promise<any[]>;
}

declare module "./scrapers/ica-scraper.ts" {
  export const scrapeIcaRecipes: () => Promise<any[]>;
}

declare module "./mock/mock-recipes.ts" {
  export const mockRecipes: any[];
}
