// components/FeaturedProductsCarousel.tsx
import Image from 'next/image';
import type { Product } from '@/types'; // Import the shared Product type
import styles from '@/styles/FeaturedProductsCarousel.module.css'; // Import CSS module

type Props = {
  products: Product[];
};

export default function FeaturedProductsCarousel({ products }: Props) {
  return (
    <section className={styles.featuredProductsCarousel}>
      <h2>Featured Products</h2>
      <div className={styles.carousel}>
        {products.map((product) => (
          <a key={product.id} href={`/product/${product.slug}`} className={styles.productCard}>
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={300} // Placeholder width
                height={300} // Placeholder height
                className={styles.productImage} // Add a class for styling
              />
            )}
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
