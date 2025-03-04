
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
  allCategoryNames?: string[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  title, 
  products,
  showCategoryHeaders = false,
  onQuantityChange,
  viewMode = "grid",
  className = "",
  allCategoryNames = []
}) => {
  // Group products by category if showCategoryHeaders is true
  const groupedProducts = React.useMemo(() => {
    if (!showCategoryHeaders) {
      return { "": products };
    }
    
    const groups: Record<string, Product[]> = {};
    
    // Initialize all categories, even empty ones
    if (allCategoryNames.length > 0) {
      allCategoryNames.forEach(category => {
        groups[category] = [];
      });
    }
    
    // Add products to their respective categories
    products.forEach(product => {
      const category = product.category || "";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });
    
    return groups;
  }, [products, showCategoryHeaders, allCategoryNames]);

  return (
    <div className={className}>
      {title && <h2 className="text-base font-bold text-[#1C1C1C] mb-3">{title}</h2>}
      
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category || "uncategorized"}>
          {showCategoryHeaders && category && (
            <h3 id={category} className="text-base font-bold text-[#1C1C1C] mt-6 mb-3 scroll-mt-[160px]">
              {category}
            </h3>
          )}
          {categoryProducts.length > 0 && (
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
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
