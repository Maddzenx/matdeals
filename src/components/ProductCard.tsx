import React, { useState, useEffect } from "react";
import { useNavigationState } from "@/hooks/useNavigationState";
import { GridProductCard } from "./product/GridProductCard";
import { ListProductCard } from "./product/ListProductCard";
import { ProductDetailsDialog } from "./product/ProductDetailsDialog";
import { formatMemberPrice } from "@/utils/transformers/determineCategory";

interface ProductCardProps {
  id: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  is_kortvara: boolean;
  onQuantityChange?: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode?: "grid" | "list";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  details,
  currentPrice,
  originalPrice,
  store,
  is_kortvara,
  onQuantityChange,
  viewMode = "grid",
}) => {
  const { cartItems } = useNavigationState();
  const [quantity, setQuantity] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const offerBadge = formatMemberPrice({ is_kortvara });
  
  useEffect(() => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      setQuantity(item.quantity);
    } else {
      setQuantity(0);
    }
  }, [cartItems, id]);

  const handleAdd = () => {
    const newQuantity = 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity, 0);
    }
  };

  const handleIncrement = () => {
    const prevQuantity = quantity;
    const newQuantity = prevQuantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity, prevQuantity);
    }
  };

  const handleDecrement = () => {
    const prevQuantity = quantity;
    const newQuantity = Math.max(0, prevQuantity - 1);
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity, prevQuantity);
    }
  };

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  const productData = {
    id,
    name,
    details,
    currentPrice,
    originalPrice,
    store,
    offerBadge,
    is_kortvara
  };

  if (viewMode === "grid") {
    return (
      <>
        <GridProductCard
          id={id}
          name={name}
          details={details}
          currentPrice={currentPrice}
          originalPrice={originalPrice}
          store={store}
          offerBadge={offerBadge}
          quantity={quantity}
          onAdd={handleAdd}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onClick={handleCardClick}
        />
        <ProductDetailsDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={productData}
          quantity={quantity}
          onAdd={handleAdd}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      </>
    );
  }

  return (
    <>
      <ListProductCard
        id={id}
        name={name}
        details={details}
        currentPrice={currentPrice}
        originalPrice={originalPrice}
        store={store}
        offerBadge={offerBadge}
        quantity={quantity}
        onAdd={handleAdd}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onClick={handleCardClick}
      />
      <ProductDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={productData}
        quantity={quantity}
        onAdd={handleAdd}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </>
  );
};
