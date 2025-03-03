
import React from "react";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  image: string;
  name: string;
  details: string;
  currentPrice: string;
  originalPrice: string;
  store: string;
  offerBadge?: string;
  category?: string;
}

interface ProductGridProps {
  title?: string;
  products: Product[];
  showCategoryHeaders?: boolean;
  onQuantityChange?: (productId: string, newQuantity: number, previousQuantity: number) => void;
  viewMode?: "grid" | "list";
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  title, 
  products,
  showCategoryHeaders = false,
  onQuantityChange,
  viewMode = "grid",
  className = ""
}) => {
  // Group products by category if showCategoryHeaders is true
  const groupedProducts = React.useMemo(() => {
    if (!showCategoryHeaders) {
      return { "": products };
    }
    
    return products.reduce((acc: Record<string, Product[]>, product) => {
      const category = product.category || "";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }, [products, showCategoryHeaders]);

  return (
    <div className={className}>
      {title && <h2 className="text-base font-bold text-[#1C1C1C] mb-3">{title}</h2>}
      
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category || "uncategorized"}>
          {showCategoryHeaders && category && (
            <h3 id={category} className="text-base font-bold text-[#1C1C1C] mt-6 mb-3 scroll-mt-16">
              {category}
            </h3>
          )}
          <div className={`${viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "flex flex-col gap-2.5"} mb-6`}>
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.image}
                name={product.name}
                details={product.details}
                currentPrice={product.currentPrice}
                originalPrice={product.originalPrice}
                store={product.store}
                offerBadge={product.offerBadge}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
