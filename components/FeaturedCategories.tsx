// components/FeaturedCategories.tsx
import Image from 'next/image';
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
            {cat.imageUrl && (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                width={200} // Placeholder width, adjust as needed
                height={200} // Placeholder height, adjust as needed
                className={styles.categoryImage} // Add a class for styling if needed
              />
            )}
            <h3>{cat.name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
