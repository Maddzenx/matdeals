
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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`flex items-center justify-center rounded-[5px] overflow-hidden bg-neutral-50 relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`max-w-full max-h-[${height}px] object-contain transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onLoad={handleImageLoad}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-[5px]"></div>
      )}
    </div>
  );
};
