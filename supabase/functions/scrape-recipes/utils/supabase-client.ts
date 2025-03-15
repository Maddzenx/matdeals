
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Create Supabase client
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  console.log("Creating Supabase client with service role key");
  
  // Use the service role key to bypass RLS policies
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Store recipes in Supabase
export async function storeRecipes(recipes: any[]) {
  if (!recipes || recipes.length === 0) {
    console.log("No recipes to store");
    return 0;
  }
  
  const supabase = createSupabaseClient();
  
  try {
    console.log(`Storing ${recipes.length} recipes in Supabase...`);
    
    // Clear existing recipes first
    console.log("Clearing existing recipes");
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Safe condition
      
    if (deleteError) {
      console.error("Error clearing existing recipes:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully cleared existing recipes.");
    
    // Insert new recipes
    let successCount = 0;
    const batchSize = 5; // Process in batches of 5
    
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1}/${Math.ceil(recipes.length/batchSize)}`);
      
      const { data, error: insertError } = await supabase
        .from('recipes')
        .insert(batch)
        .select();
        
      if (insertError) {
        console.error(`Error inserting batch of recipes:`, insertError);
        console.error("Error details:", JSON.stringify(insertError));
      } else {
        console.log(`Successfully inserted batch of ${data?.length || 0} recipes`);
        successCount += data?.length || 0;
      }
    }
    
    console.log(`Successfully inserted ${successCount} of ${recipes.length} recipes`);
    return successCount;
  } catch (error) {
    console.error("Error storing recipes in Supabase:", error);
    throw error;
  }
}
