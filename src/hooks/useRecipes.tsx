
import { useEffect, useState, useCallback } from "react";
import { Recipe } from "@/types/recipe";
import { useSupabaseProducts } from "@/hooks/useSupabaseProducts";
import { 
  fetchRecipesByCategory, 
  scrapeRecipesFromApi,
  generateRecipesFromDiscountedProducts,
  insertGeneratedRecipes
} from "@/services/recipeService";
import { getRecipeCategories, RecipeCategory, defaultRecipeCategories } from "@/utils/recipeCategories";
import { useAppSession } from "@/hooks/useAppSession";
import { adaptToDataProducts } from "@/utils/productAdapter";

export type { Recipe } from "@/types/recipe";

export const useRecipes = (initialCategory: string = "Middag") => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isFirstLoad } = useAppSession();
  
  // Get products for matching with ingredients
  const { products } = useSupabaseProducts();

  const fetchRecipes = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!products || products.length === 0) {
        console.log('Waiting for products to load...');
        return;
      }
      
      console.log('Fetching recipes with category:', category);
      // Convert products to the expected type format before passing to fetchRecipesByCategory
      const adaptedProducts = adaptToDataProducts(products);
      const fetchedRecipes = await fetchRecipesByCategory(category, adaptedProducts);
      console.log('Fetched recipes:', fetchedRecipes.length);
      
      if (fetchedRecipes.length === 0) {
        setError(new Error('Inga recept hittades. Försök uppdatera sidan eller välj en annan kategori.'));
      } else {
        setRecipes(fetchedRecipes);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err : new Error('Ett fel uppstod vid hämtning av recept'));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [products]);

  const generateAndInsertRecipes = useCallback(async () => {
    if (isGenerating) {
      console.log('Recipe generation already in progress, skipping...');
      return false;
    }

    try {
      setIsGenerating(true);
      setLoading(true);
      setError(null);
      console.log('Starting recipe generation process...');
      
      if (!products || products.length === 0) {
        const error = new Error('Inga produkter tillgängliga. Vänta medan produkterna laddas.');
        console.log(error.message);
        setError(error);
        return false;
      }
      
      // Generate recipes based on discounted products - using adapter for type conversion
      const adaptedProducts = adaptToDataProducts(products);
      const generatedRecipes = await generateRecipesFromDiscountedProducts(adaptedProducts);
      console.log('Generated recipes:', generatedRecipes.length);
      
      if (generatedRecipes.length === 0) {
        const error = new Error('Kunde inte generera några recept. Försök igen senare.');
        console.log(error.message);
        setError(error);
        return false;
      }
      
      // Insert the generated recipes into the database
      const { success, error } = await insertGeneratedRecipes(generatedRecipes);
      
      if (!success) {
        const err = new Error(`Kunde inte spara recepten: ${error}`);
        console.error(err.message);
        setError(err);
        return false;
      }
      
      console.log('Successfully inserted recipes, refreshing recipe list');
      // Refresh the recipes list to include the new recipes
      await fetchRecipes(activeCategory);
      return true;
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError(err instanceof Error ? err : new Error('Ett fel uppstod vid generering av recept'));
      return false;
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  }, [products, activeCategory, fetchRecipes, isGenerating]);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await getRecipeCategories();
      
      if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
        // Extract category names and set them
        const categoryNames = ['Alla', ...fetchedCategories.map((cat: RecipeCategory) => cat.name)];
        setCategories(categoryNames);
        
        // If active category not in the list, update it
        if (!categoryNames.includes(activeCategory)) {
          setActiveCategory('Alla');
        }
      } else {
        // Use default categories if no categories returned
        console.log("Using default recipe categories");
        const defaultCategoryNames = ['Alla', ...defaultRecipeCategories.map(cat => cat.name)];
        setCategories(defaultCategoryNames);
        
        if (!defaultCategoryNames.includes(activeCategory)) {
          setActiveCategory('Alla');
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories on error
      const defaultCategoryNames = ['Alla', ...defaultRecipeCategories.map(cat => cat.name)];
      setCategories(defaultCategoryNames);
      if (!defaultCategoryNames.includes(activeCategory)) {
        setActiveCategory('Alla');
      }
    }
  }, [activeCategory]);

  const scrapeRecipes = useCallback(async () => {
    try {
      setLoading(true);
      
      const result = await scrapeRecipesFromApi(false); // Don't show notifications
      
      // Refresh categories and recipes after scraping
      await fetchCategories();
      await fetchRecipes(activeCategory);
      
      return result;
    } catch (err) {
      console.error('Error scraping recipes:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [activeCategory, fetchCategories, fetchRecipes]);

  // Auto scrape recipes on first app load
  useEffect(() => {
    if (isFirstLoad) {
      console.log("First load of app, starting recipe process");
      const timer = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          console.log("Scraping recipes...");
          const scrapeResult = await scrapeRecipes();
          
          if (!scrapeResult.success) {
            throw new Error(scrapeResult.error || 'Failed to scrape recipes');
          }
          
          // Only generate recipes if we don't have any
          if (recipes.length === 0) {
            console.log("No recipes found, generating new ones...");
            const generateResult = await generateAndInsertRecipes();
            
            if (!generateResult) {
              throw new Error('Failed to generate and insert recipes');
            }
          }
        } catch (error) {
          console.error("Error during initial recipe setup:", error);
          setError(error instanceof Error ? error : new Error('Ett fel uppstod vid initial laddning av recept'));
        } finally {
          setLoading(false);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad, scrapeRecipes, generateAndInsertRecipes, recipes.length]);

  const changeCategory = useCallback((category: string) => {
    console.log('Changing category to:', category);
    setActiveCategory(category);
    fetchRecipes(category);
  }, [fetchRecipes]);

  // Update recipes when products change
  useEffect(() => {
    if (products.length > 0 && !isGenerating) {
      // Only regenerate recipes if we don't have any recipes yet
      if (recipes.length === 0) {
        console.log("No recipes found, generating new ones...");
        generateAndInsertRecipes();
      } else {
        console.log("Recipes already exist, skipping generation");
        fetchRecipes(activeCategory);
      }
    }
  }, [products, activeCategory, fetchRecipes, generateAndInsertRecipes, recipes.length, isGenerating]);

  // Initial fetch of categories and recipes
  useEffect(() => {
    console.log("Initial fetch of categories and recipes");
    fetchCategories();
    fetchRecipes(activeCategory);
  }, [fetchCategories, fetchRecipes, activeCategory]);

  return {
    recipes,
    loading,
    error,
    activeCategory,
    categories,
    changeCategory,
    scrapeRecipes,
    generateAndInsertRecipes
  };
};
