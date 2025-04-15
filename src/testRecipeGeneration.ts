import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { Product } from './data/types';
import { Recipe, RecipeInstructions, RecipeIngredients, RecipeIngredient } from './types/recipe';
import crypto from 'crypto';
import { insertGeneratedRecipes } from './services/recipeService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '../.env') });

const testProduct: Product = {
  id: 'test-2',
  name: 'Fläskfilé',
  description: 'Färsk fläskfilé',
  price: 89.90,
  originalPrice: '109.90',
  currentPrice: '89.90',
  image: 'https://example.com/flaskfile.jpg',
  store: 'ICA',
  isDiscounted: true,
  category: 'Kött',
  unit: 'kg',
  quantity: 1
};

async function generateTestRecipe(product: Product): Promise<Recipe> {
  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_API_KEY environment variable is not set');
  }

  const prompt = `Create a detailed Swedish recipe using ${product.name} as the main ingredient. 
The recipe should be authentic, practical, and include exact measurements. Follow this structure:

1. Title: A creative Swedish name that reflects the dish
2. Description: A brief overview of the dish, its flavors, and its origin
3. Category: ${product.category}
4. Time: Break down into preparation time and cooking time
5. Servings: Number of servings and portion sizes
6. Difficulty: Lätt/Medel/Avancerad with explanation
7. Ingredients: List with exact measurements in Swedish units (dl, msk, tsk, g, kg)
   - Group ingredients by their use (main ingredients, sauce, garnish)
   - Include substitutions for common allergies
   - Note which ingredients are optional

8. Instructions: Create extremely detailed, step-by-step instructions with clear explanations:

   Kitchen Setup:
   - Required equipment and tools
   - Recommended pan/pot sizes
   - Oven temperature if needed
   - Safety precautions

   Preparation Steps:
   - Detailed prep instructions for each ingredient
   - Proper cutting techniques and sizes
   - Time-saving prep tips
   - Make-ahead suggestions

   Cooking Steps:
   - Exact temperatures for each step
   - Precise cooking times
   - Multiple visual and tactile cues for doneness
   - Common mistakes to avoid
   - Explanations for why each step is important
   - Tips for achieving the best results

   Finishing and Plating:
   - How to check for proper seasoning
   - Resting time if needed
   - Plating instructions with artistic details
   - Garnishing suggestions
   - Photos or descriptions of how it should look

   Serving and Storage:
   - Recommended side dishes with pairing explanations
   - Wine or beverage pairing suggestions
   - How to store leftovers (container type, temperature)
   - Detailed reheating instructions for best results
   - How long it keeps in refrigerator/freezer
   - Make-ahead and meal prep tips`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const recipeText = data.choices[0].message.content;

    // Parse the recipe text into a structured format
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      category: product.category,
      time_minutes: 0,
      servings: 0,
      difficulty: 'Medel',
      ingredients: [] as RecipeIngredient[],
      instructions: [] as string[],
      created_at: new Date().toISOString(),
      store: product.store
    };

    // Parse the recipe text and populate the recipe object
    // This is a simplified version - you might want to enhance the parsing logic
    const lines = recipeText.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.startsWith('Title:')) {
        recipe.title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Description:')) {
        recipe.description = line.replace('Description:', '').trim();
      } else if (line.startsWith('Time:')) {
        const timeMatch = line.match(/(\d+)\s+minutes?/);
        if (timeMatch) {
          recipe.time_minutes = parseInt(timeMatch[1], 10);
        }
      } else if (line.startsWith('Servings:')) {
        const servingsMatch = line.match(/(\d+)/);
        if (servingsMatch) {
          recipe.servings = parseInt(servingsMatch[1], 10);
        }
      } else if (line.startsWith('Difficulty:')) {
        recipe.difficulty = line.replace('Difficulty:', '').trim();
      } else if (line.startsWith('-')) {
        if (currentSection === 'ingredients') {
          const ingredientMatch = line.match(/-?\s*([\d.]+)\s*([a-zA-ZåäöÅÄÖ]+)\s+(.+)/);
          if (ingredientMatch) {
            recipe.ingredients.push({
              name: ingredientMatch[3].trim(),
              amount: parseFloat(ingredientMatch[1]),
              unit: ingredientMatch[2].trim()
            });
          }
        } else if (currentSection === 'instructions') {
          recipe.instructions.push(line.replace('-', '').trim());
        }
      } else if (line.toLowerCase().includes('ingredients')) {
        currentSection = 'ingredients';
      } else if (line.toLowerCase().includes('instructions')) {
        currentSection = 'instructions';
      }
    }

    return recipe;
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw error;
  }
}

async function testRecipeGeneration() {
  console.log('Starting recipe generation test...');
  console.log('Test product:', testProduct);

  try {
    const recipe = await generateTestRecipe(testProduct);
    console.log('\nGenerated Recipe:');
    console.log('================');
    console.log(`Title: ${recipe.title}`);
    console.log(`Description: ${recipe.description}`);
    console.log(`Category: ${recipe.category}`);
    console.log(`\nTime: ${recipe.time_minutes} minutes`);
    console.log(`Servings: ${recipe.servings}`);
    console.log(`Difficulty: ${recipe.difficulty}`);
    
    console.log('\nIngredients:');
    recipe.ingredients.forEach(ingredient => {
      console.log(`- ${ingredient.amount} ${ingredient.unit} ${ingredient.name}`);
    });
    
    console.log('\nInstructions:');
    recipe.instructions.forEach((instruction, index) => {
      console.log(`${index + 1}. ${instruction}`);
    });

    console.log('\nInserting recipe into database...');
    await insertGeneratedRecipes([recipe]);
    console.log('Successfully inserted recipe into database!');
  } catch (error) {
    console.error('Error in recipe generation test:', error);
  }
}

testRecipeGeneration(); 