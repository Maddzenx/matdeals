
import React from "react";
import { CartItem } from "@/hooks/useNavigationState";
import { StoreProductGroup } from "./StoreProductGroup";
import { CategoryProductGroup } from "./CategoryProductGroup";
import { ConnectedRecipes } from "./ConnectedRecipes";
import { EmptyShoppingList } from "./EmptyShoppingList";

interface ShoppingListContentProps {
  activeTab: "category" | "stores";
  cartItems: CartItem[];
  handleItemCheck: (id: string) => void;
  handleIncrement: (id: string) => void;
  handleDecrement: (id: string) => void;
  handleSetQuantity: (id: string, quantity: number) => void;
  groupedByStore: Record<string, CartItem[]>;
  sortedStoreNames: string[];
  groupedByCategory: Record<string, CartItem[]>;
  sortedCategoryNames: string[];
}

export const ShoppingListContent: React.FC<ShoppingListContentProps> = ({
  activeTab,
  cartItems,
  handleItemCheck,
  handleIncrement,
  handleDecrement,
  handleSetQuantity,
  groupedByStore,
  sortedStoreNames,
  groupedByCategory,
  sortedCategoryNames
}) => {
  if (cartItems.length === 0) {
    return <EmptyShoppingList />;
  }

  return (
    <div className="space-y-0 px-4 mt-4">
      {activeTab === "stores" ? (
        <>
          {sortedStoreNames.map((storeName) => (
            <StoreProductGroup
              key={storeName}
              storeName={storeName}
              items={groupedByStore[storeName]}
              onItemCheck={handleItemCheck}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onSetQuantity={handleSetQuantity}
            />
          ))}
          <ConnectedRecipes cartItems={cartItems} />
        </>
      ) : (
        <>
          {sortedCategoryNames.map((categoryName) => (
            <CategoryProductGroup
              key={categoryName}
              categoryName={categoryName}
              items={groupedByCategory[categoryName]}
              onItemCheck={handleItemCheck}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onSetQuantity={handleSetQuantity}
            />
          ))}
          <ConnectedRecipes cartItems={cartItems} />
        </>
      )}
    </div>
  );
};
