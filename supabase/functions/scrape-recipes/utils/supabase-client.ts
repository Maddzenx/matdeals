
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize the Supabase client
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Store recipes in Supabase
export async function storeRecipes(recipes: any[]): Promise<number> {
  if (!recipes || recipes.length === 0) {
    console.log("No recipes to store");
    return 0;
  }
  
  console.log(`Preparing to store ${recipes.length} recipes in Supabase`);
  
  try {
    const supabase = createSupabaseClient();
    
    // Insert in batches to avoid request size limits
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1} of recipes`);
      
      const { data, error } = await supabase
        .from('recipes')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`Error inserting recipe batch:`, error);
      } else {
        insertedCount += data.length;
        console.log(`Successfully inserted/updated ${data.length} recipes`);
      }
    }
    
    return insertedCount;
  } catch (error) {
    console.error("Error in storeRecipes:", error);
    return 0;
  }
}
