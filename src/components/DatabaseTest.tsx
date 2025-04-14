import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Recipe } from '../types/recipe';
import { Product } from '../types/product';

// Use hardcoded values for deployment reliability
const supabaseUrl = 'https://rnccetwpkhskcaxsqrig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuY2NldHdwa2hza2NheHNxcmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTY2ODgsImV4cCI6MjA1NjU5MjY4OH0.sRbjsz0pzA34GPrGg6qZsjfOa-EGEq8DKjsX6GG01PE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DatabaseTest() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recipes
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*');

        if (recipesError) throw recipesError;
        setRecipes(recipesData || []);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        console.log('Raw products data:', productsData);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Database Test</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Recipes ({recipes.length})</h3>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
          {JSON.stringify(recipes, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Products ({products.length})</h3>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
          {JSON.stringify(products, null, 2)}
        </pre>
      </div>
    </div>
  );
}
