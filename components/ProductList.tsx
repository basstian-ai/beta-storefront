// components/ProductList.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api';
import styles from './ProductList.module.css'; // Import the CSS module

export interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  if (!products || products.length === 0) {
        // Apply the new style for the empty state
        return <p className={styles.emptyProductList}>No products found.</p>;
  }

  return (
    <div className={styles.productGrid}> {/* Use CSS module class */}
      {products.map((product) => (
        <Link href={`/product/${product.id}`} key={product.id} passHref legacyBehavior>
          <a className={styles.productCard}> {/* Use CSS module class */}
            <div className={styles.imageWrapper}> {/* Use CSS module class */}
              <Image
                src={product.imageUrl || '/placeholder-image.webp'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <h3>{product.name}</h3>
            <p className={styles.price}>${product.price.toFixed(2)}</p> {/* Use CSS module class */}
            <p className={styles.brand}>Brand: {product.brand}</p> {/* Use CSS module class */}
            <p className={styles.size}>Size: {product.size}</p> {/* Use CSS module class */}
          </a>
        </Link>
      ))}
    </div>
  );
};

export default ProductList;
