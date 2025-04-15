import { useEffect } from 'react';
import { useSupabaseProducts } from './useSupabaseProducts';
import { generateRecipesFromDiscountedProducts, insertGeneratedRecipes } from '@/services/recipeService';
import { useQueryClient } from '@tanstack/react-query';
import { Product } from '@/data/types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to parse Swedish price strings
function parseSwedishPrice(price: string | number): number {
  if (typeof price === 'number') return price;
  
  // Handle "X för Y" format (e.g., "3 för 22,00")
  const match = price.match(/(\d+)\s+för\s+(\d+[,.]\d+)/i);
  if (match) {
    const quantity = parseInt(match[1], 10);
    const totalPrice = parseFloat(match[2].replace(',', '.'));
    return totalPrice / quantity;
  }
  
  // Handle regular price format (e.g., "22,00")
  return parseFloat(price.replace(',', '.').replace(/[^\d.-]/g, ''));
}

export const useAutoRecipeGeneration = () => {
  const { products, loading: isLoadingProducts } = useSupabaseProducts();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAndGenerateRecipes = async () => {
      if (isLoadingProducts || !products || products.length === 0) {
        return;
      }

      try {
        // Check if scraping was completed today
        const { data: lastScrape, error: scrapeError } = await supabase
          .from('scrape_logs')
          .select('completed_at')
          .order('completed_at', { ascending: false })
          .limit(1);

        if (scrapeError) {
          console.error('Error checking scrape logs:', scrapeError);
          return;
        }

        // If no scraping has been done or last scrape was more than a day ago, skip
        if (!lastScrape || lastScrape.length === 0 || 
            new Date(lastScrape[0].completed_at).getTime() < Date.now() - 24 * 60 * 60 * 1000) {
          console.log('No recent scraping detected, skipping recipe generation');
          return;
        }

        // Convert prices to numbers and check for discounts
        const discountedProducts = products.filter(product => {
          if (!product.originalPrice || !product.currentPrice) return false;
          
          // Parse prices using the helper function
          const originalPrice = parseSwedishPrice(product.originalPrice);
          const currentPrice = parseSwedishPrice(product.currentPrice);

          // Log price comparison for debugging
          console.log(`Comparing prices for ${product.name}:`, {
            originalPrice,
            currentPrice,
            isDiscounted: originalPrice > currentPrice
          });

          return originalPrice > currentPrice;
        });

        if (discountedProducts.length === 0) {
          console.log('No discounted products found for recipe generation');
          return;
        }

        console.log(`Found ${discountedProducts.length} discounted products, generating recipes...`);
        
        // Convert products to the correct type, ensuring all required fields are present
        const adaptedProducts: Product[] = discountedProducts.map(p => ({
          ...p,
          price: typeof p.price === 'string' ? parseSwedishPrice(p.price) : p.price,
          // Keep originalPrice and currentPrice as strings
          originalPrice: String(p.originalPrice),
          currentPrice: String(p.currentPrice),
          // Ensure required fields are present
          image: p.image || 'https://example.com/placeholder.jpg',
          store: p.store || 'Unknown',
          category: p.category || 'Other'
        }));
        
        // Generate recipes
        const generatedRecipes = await generateRecipesFromDiscountedProducts(adaptedProducts);
        
        if (generatedRecipes.length > 0) {
          console.log(`Generated ${generatedRecipes.length} new recipes`);
          
          // Insert recipes into database
          const { success, error } = await insertGeneratedRecipes(generatedRecipes);
          
          if (success) {
            console.log('Successfully inserted new recipes');
            // Invalidate recipes query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
          } else {
            console.error('Failed to insert recipes:', error);
          }
        }
      } catch (error) {
        console.error('Error in automatic recipe generation:', error);
      }
    };

    // Run immediately when products are loaded
    checkAndGenerateRecipes();

    // Set up interval to check daily (in case scraping schedule changes)
    const interval = setInterval(checkAndGenerateRecipes, 24 * 60 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [products, isLoadingProducts, queryClient]);
}; 