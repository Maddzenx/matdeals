
import React, { useState, useEffect } from "react";
import { useNavigationState } from "@/hooks/useNavigationState";
import { GridProductCard } from "./product/GridProductCard";
import { ListProductCard } from "./product/ListProductCard";
import { ProductDetailsDialog } from "./product/ProductDetailsDialog";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  onQuantityChange?: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode?: "grid" | "list";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  name,
  details,
  currentPrice,
  originalPrice,
  store,
  offerBadge,
  onQuantityChange,
  viewMode = "grid",
}) => {
  const { cartItems } = useNavigationState();
  const [quantity, setQuantity] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Enhanced check for meaningful offer badges
  // Filter out generic badges that don't provide useful information
  const shouldDisplayBadge = offerBadge && 
    offerBadge.trim() !== "" && 
    !["erbjudande", "veckans erbjudande", "weekly offer", "offer"].includes(offerBadge.toLowerCase().trim());
  
  // Sync with global cart state
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
    image,
    name,
    details,
    currentPrice,
    originalPrice,
    store,
    offerBadge: shouldDisplayBadge ? offerBadge : undefined
  };

  // Choose between grid and list view
  if (viewMode === "grid") {
    return (
      <>
        <GridProductCard
          id={id}
          image={image}
          name={name}
          details={details}
          currentPrice={currentPrice}
          originalPrice={originalPrice}
          store={store}
          offerBadge={shouldDisplayBadge ? offerBadge : undefined}
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

  // Default to list view
  return (
    <>
      <ListProductCard
        id={id}
        image={image}
        name={name}
        details={details}
        currentPrice={currentPrice}
        originalPrice={originalPrice}
        store={store}
        offerBadge={shouldDisplayBadge ? offerBadge : undefined}
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
