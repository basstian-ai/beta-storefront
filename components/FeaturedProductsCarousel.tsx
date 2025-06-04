// components/FeaturedProductsCarousel.tsx
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
          <a key={product.id} href={`/products/${product.slug}`} className={styles.productCard}>
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
