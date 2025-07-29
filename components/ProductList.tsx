// components/ProductList.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api';

export interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="text-center text-gray-500 py-8">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <Link href={`/product/${product.id}`} key={product.id} passHref>
          <div className="bg-secondary rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer">
            <div className="relative w-full h-64">
              <Image
                src={product.imageUrl || '/placeholder-image.webp'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
              <p className="text-accent font-bold mt-2">${product.price.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mt-1">Brand: {product.brand}</p>
              <p className="text-gray-500 text-sm">Size: {product.size}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductList;
