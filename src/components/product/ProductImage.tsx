
import React, { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  height: number;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  height,
  className = "",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  // Use a placeholder image if the original image fails to load
  const imgSrc = imageError 
    ? "https://assets.icanet.se/t_product_large_v1,f_auto/7310865085313.jpg" 
    : src;

  return (
    <div className={`flex items-center justify-center rounded-[5px] overflow-hidden bg-neutral-50 relative ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-[5px]"></div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        className={`max-w-full max-h-full object-contain transition-opacity duration-200 p-1 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: `${height}px` }}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};
