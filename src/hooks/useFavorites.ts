import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('recipe_id');

      if (fetchError) {
        if (fetchError.code === '42P01') {
          // Table doesn't exist yet
          console.log('Favorites table does not exist yet');
          setFavoriteIds([]);
          return;
        }
        throw fetchError;
      }

      setFavoriteIds(data?.map(item => item.recipe_id) || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    try {
      const isFavorite = favoriteIds.includes(recipeId);
      
      if (isFavorite) {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('recipe_id', recipeId);

        if (deleteError) throw deleteError;
        setFavoriteIds(prev => prev.filter(id => id !== recipeId));
      } else {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert([{ recipe_id: recipeId }]);

        if (insertError) throw insertError;
        setFavoriteIds(prev => [...prev, recipeId]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while toggling favorite');
    }
  }, [favoriteIds]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favoriteIds,
    loading,
    error,
    toggleFavorite
  };
} 