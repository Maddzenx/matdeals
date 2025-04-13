import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { RecipeIngredient } from '@/types/recipe';

export const useProductMatch = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  }, []);

  const findMatchingProducts = useCallback((ingredients: RecipeIngredient[]) => {
    const matchedProducts: Product[] = [];
    const unmatchedIngredients: RecipeIngredient[] = [];

    ingredients.forEach(ingredient => {
      const matches = products.filter(product => 
        product.name.toLowerCase().includes(ingredient.name.toLowerCase())
      );

      if (matches.length > 0) {
        matchedProducts.push(...matches);
      } else {
        unmatchedIngredients.push(ingredient);
      }
    });

    return {
      matchedProducts,
      unmatchedIngredients
    };
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    findMatchingProducts
  };
};
