import React from 'react';
import { Recipe } from '@/types/recipe';
import { Product } from '@/types/product';
import { MatchedIngredient } from '@/types/matchedIngredient';
import { Clock, Users, ChefHat, ShoppingCart, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface DetailedRecipeViewProps {
  recipe: Recipe;
  matchedProducts: Product[];
  matchedIngredients: MatchedIngredient[];
  onAddToCart: () => void;
  onAddToMealPlan: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export const DetailedRecipeView: React.FC<DetailedRecipeViewProps> = ({
  recipe,
  matchedProducts,
  matchedIngredients,
  onAddToCart,
  onAddToMealPlan,
  onToggleFavorite,
  isFavorite
}) => {
  const isMobile = useIsMobile();
  const totalPrice = matchedProducts.reduce((sum, product) => {
    const price = parseFloat((product.currentPrice || '0').replace(/[^0-9,.]/g, '').replace(',', '.'));
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Recipe Header */}
      <div className="relative">
        <img
          src={recipe.image_url || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-lg shadow-lg"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
          <h1 className="text-3xl font-bold text-white">{recipe.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {recipe.category}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {recipe.difficulty}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Tid</p>
              <p className="font-medium">{recipe.time_minutes} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Portioner</p>
              <p className="font-medium">{recipe.servings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Svårighet</p>
              <p className="font-medium">{recipe.difficulty}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Totalpris</p>
              <p className="font-medium">{totalPrice.toFixed(2)} kr</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onAddToCart}
          className="flex-1 min-w-[200px]"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Lägg till i kundvagn
        </Button>
        <Button 
          onClick={onAddToMealPlan}
          variant="outline"
          className="flex-1 min-w-[200px]"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Lägg till i veckoplan
        </Button>
        <Button 
          onClick={onToggleFavorite}
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </Button>
      </div>

      {/* Description */}
      {recipe.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-700">{recipe.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Ingredients and Instructions */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingredients">Ingredienser</TabsTrigger>
          <TabsTrigger value="instructions">Instruktioner</TabsTrigger>
        </TabsList>
        <TabsContent value="ingredients">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 p-4">
              {matchedIngredients.map((ingredient, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-sm text-gray-500">
                      {ingredient.amount} {ingredient.unit}
                      {ingredient.notes && ` (${ingredient.notes})`}
                    </p>
                  </div>
                  {ingredient.matchedProduct && (
                    <div className="text-right">
                      <p className="font-medium">{ingredient.matchedProduct.currentPrice}</p>
                      <p className="text-sm text-gray-500">{ingredient.matchedProduct.store}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="instructions">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 p-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Matched Products */}
      {matchedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hittade produkter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {matchedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-primary font-medium">{product.currentPrice}</p>
                    <p className="text-sm text-gray-500">{product.store}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 