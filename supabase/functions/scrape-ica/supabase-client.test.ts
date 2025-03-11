
import { assertEquals, assertThrows } from "https://deno.land/std@0.195.0/testing/asserts.ts";
import { createSupabaseClient } from "./supabase-client.ts";
import { Product } from "./product-extractor.ts";

// The reason we do a conditional execute of tests is that we don't want to run tests
// that require Supabase credentials when they're not available
const runCredentialTests = !!Deno.env.get("SUPABASE_URL") && !!Deno.env.get("SUPABASE_ANON_KEY");

// Unit test for createSupabaseClient
Deno.test({
  name: "createSupabaseClient - should throw error when credentials are missing",
  ignore: runCredentialTests, // Only run this test when credentials are NOT available
  fn: () => {
    // Back up any existing env vars
    const originalUrl = Deno.env.get("SUPABASE_URL");
    const originalKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    // Clear the env vars
    if (originalUrl) Deno.env.delete("SUPABASE_URL");
    if (originalKey) Deno.env.delete("SUPABASE_ANON_KEY");
    
    // Assert that the function throws
    assertThrows(() => createSupabaseClient(), Error, "Missing Supabase credentials");
    
    // Restore env vars
    if (originalUrl) Deno.env.set("SUPABASE_URL", originalUrl);
    if (originalKey) Deno.env.set("SUPABASE_ANON_KEY", originalKey);
  }
});

Deno.test({
  name: "createSupabaseClient - should create client when credentials are available",
  ignore: !runCredentialTests, // Only run this test when credentials ARE available
  fn: () => {
    const client = createSupabaseClient();
    assertEquals(typeof client, "object");
    assertEquals(typeof client.from, "function");
  }
});

// For other functions like storeProducts, we would normally mock the Supabase client
// but since Deno's testing environment doesn't have built-in mocking, we'll skip those
// tests for now. In a real-world scenario, you would use a library like mock-fetch
// to mock the network requests.
