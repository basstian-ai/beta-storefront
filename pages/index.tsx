import Head from 'next/head';
import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import { fetchHeroBanner, fetchCategories } from '@/lib/api'; // fetchCategories might be here
import type { HeroContent } from '@/types'; // Adjust path
import type { Category } from '@/types'; // Assuming Category type exists
import styles from '../styles/Home.module.css';

type HomePageProps = {
  hero: HeroContent;
  categories: Category[]; // Assuming categories are part of props
  error?: string;
};

export async function getStaticProps(): Promise<{ props: HomePageProps, revalidate?: number }> {
  let hero: HeroContent;
  let categories: Category[] = [];
  let error: string | undefined = undefined;

  try {
    hero = await fetchHeroBanner();
  } catch (fetchError) {
    console.error("Error fetching hero data for HomePage:", fetchError);
    hero = { // Fallback hero data
      title: 'Welcome to Our Store!',
      description: 'We are currently unable to load the latest offers. Please check back soon.',
      ctaText: 'Explore Products',
      ctaLink: '/products',
      imageUrl: 'https://via.placeholder.com/1200x400.png?text=Our+Store',
      imageAlt: 'Default hero image'
    };
    error = 'Failed to load hero banner data.';
  }

  try {
    categories = await fetchCategories();
  } catch (fetchError) {
    console.error("Error fetching categories for Layout in HomePage:", fetchError);
    // categories will remain empty if fetch fails, Layout should handle this
    // Optionally, you could set another error specific to categories if needed
  }

  return {
    props: {
      hero,
      categories,
      error, // This will be undefined if hero fetch succeeded
    },
    revalidate: 60,
  };
}

export default function HomePage({ hero, categories, error }: HomePageProps) {
  return (
    <Layout categories={categories}> {/* Pass categories to Layout */}
      <Head>
        <title>Home Page</title>
        <meta name="description" content="Welcome to our e-commerce store." />
        {/* Viewport and favicon are usually in _app.tsx or Layout, but keeping if they were specific here */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Ensure hero is always defined, even if it's fallback data */}
      <HeroBanner {...hero} />

      <main className={styles.main}>
        {/* Other homepage content can go here */}
      </main>
    </Layout>
  );
}
