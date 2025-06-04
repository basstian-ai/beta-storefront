// components/FeaturedCategories.tsx
import styles from '../styles/FeaturedCategories.module.css';

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
};

type FeaturedCategoriesProps = {
  categories: Category[];
};

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  return (
    <section className={styles.featuredCategories}>
      <h2>Featured Categories</h2>
      <div className={styles.categoryGrid}>
        {categories.map(cat => (
          <a key={cat.id} href={`/category/${cat.slug}`} className={styles.categoryCard}>
            {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} />}
            <h3>{cat.name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
