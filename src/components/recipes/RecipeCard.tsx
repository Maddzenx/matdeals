import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types/recipe";
import { Product } from "@/data/types";
import { RecipePrice } from "./RecipePrice";
import { Badge } from "../ui/badge";
import { ShoppingCart, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useCart } from "@/hooks/useCart";

export const RecipeCard = ({
  recipe,
  products = [],
  onAddToShoppingList,
  onAddToMealPlan,
  isShort = false
}: {
  recipe: Recipe;
  products?: Product[];
  onAddToShoppingList?: (recipe: Recipe) => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
  isShort?: boolean;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToMealPlan } = useMealPlan();
  const { addProduct } = useCart();

  const handleAddToShoppingListClick = async () => {
    try {
      await onAddToShoppingList?.(recipe);
      toast({
        title: "Recept tillagt i inköpslistan!",
        description: "Du hittar receptet i inköpslistan.",
      });
    } catch (error) {
      console.error("Error adding to shopping list:", error);
    }
  };

  const handleAddToMealPlanClick = async () => {
    try {
      await addToMealPlan(recipe.id, "default");
      toast({
        title: "Recept tillagt i matsedeln!",
        description: "Du hittar receptet i matsedeln.",
      });
    } catch (error) {
      console.error("Error adding to meal plan:", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const hasDiscount = Boolean(
    recipe.calculatedOriginalPrice && 
    recipe.calculatedPrice && 
    recipe.calculatedOriginalPrice > recipe.calculatedPrice
  );

  return (
    <Card
      className="bg-white shadow-md rounded-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {recipe.title}
        </CardTitle>
        <CardDescription className="text-gray-500 line-clamp-2">
          {recipe.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <RecipePrice recipe={recipe} compact={isShort} />
          {hasDiscount && recipe.savings && recipe.savings > 0 && (
            <Badge className="bg-green-500 text-white font-medium">
              Spara {recipe.savings.toFixed(2)} kr
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{recipe.category}</Badge>
          {recipe.difficulty && (
            <Badge variant="outline">{recipe.difficulty}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToShoppingListClick();
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Inköpslista
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToMealPlanClick();
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Matsedel
        </Button>
      </CardFooter>
    </Card>
  );
};
