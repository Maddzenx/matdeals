
import React from 'react';
import { Product } from '../types/product';

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="space-y-4">
      {products.map((product: Product) => (
        <div key={product.id} className="border p-4 rounded-md">
          <h3 className="font-semibold">{product.name}</h3>
          <p>{product.price}</p>
          <p>{product.store}</p>
          <p>{product.category}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
