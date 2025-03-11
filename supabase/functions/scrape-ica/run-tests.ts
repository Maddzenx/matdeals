
/**
 * Test runner for the scrape-ica function
 * 
 * Run this with:
 * deno run --allow-net --allow-env run-tests.ts
 */

import { runTests } from "https://deno.land/std@0.195.0/testing/mod.ts";

console.log("Running tests for scrape-ica function...");

// Run all test files
await runTests({
  files: [
    "./product-extractor.test.ts",
    "./dom-utils.test.ts",
    "./supabase-client.test.ts",
  ],
  // If you want to filter tests, you can use these options:
  // filter: { ... },
  // only: [ ... ],
});

console.log("All tests completed!");
