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
        {categories.map((cat) => (
          <a key={cat.id} href={`/category/${cat.slug}`} className={styles.categoryCard}>
            {cat.imageUrl && (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                width={400}
                height={400}
                className={styles.categoryImage}
                sizes="(max-width:768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL="/img/placeholder.svg"
              />
            )}
            <h3>{cat.name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
