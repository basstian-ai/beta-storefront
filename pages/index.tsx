import Head from 'next/head';
import Layout from '@/components/Layout'; // Assuming Layout component exists
import HeroBanner from '@/components/HeroBanner';
import { fetchHeroBanner } from '@/lib/api';
import styles from '../styles/Home.module.css'; // Assuming Home.module.css exists
import { Category } from '../types'; // Keep Category if Layout needs it, but fetchCategories is removed from this page
import { fetchCategories } from '../lib/api'; // Keep if Layout needs it

// Define the type for hero props, it should match HeroBannerProps
type HeroProps = {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  imageAlt?: string;
};

type HomePageProps = {
  hero: HeroProps;
  categories: Category[]; // Added categories here if Layout needs them
  error?: string; // Optional error message
};

export async function getStaticProps() {
  let heroData;
  let categories: Category[] = []; // Initialize categories

  try {
    heroData = await fetchHeroBanner();
  } catch (error) {
    console.error("Error fetching hero data for HomePage:", error);
    // Fallback hero data
    heroData = {
      title: 'Welcome to Our Store!',
      description: 'We are currently unable to load the latest offers. Please check back soon.',
      ctaText: 'Explore Products',
      ctaLink: '/products',
      imageUrl: 'https://via.placeholder.com/1200x400.png?text=Our+Store',
      imageAlt: 'Default hero image'
    };
  }

  try {
    // Assuming Layout still needs categories, fetching them here.
    // If Layout is refactored to fetch its own data, this can be removed.
    categories = await fetchCategories();
  } catch (error) {
    console.error("Error fetching categories for Layout in HomePage:", error);
    // categories will remain empty if fetch fails, Layout should handle this
  }

  return {
    props: {
      hero: heroData,
      categories: categories, // Pass categories to props
      // Conditionally add error to props if heroData fetching failed specifically
      ...(heroData.title === 'Welcome to Our Store!' && { error: 'Failed to load hero banner data.' }),
    },
    revalidate: 60, // ISR (Incremental Static Regeneration)
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

      {hero && <HeroBanner {...hero} />}

      <main className={styles.main}>
        {/* Other homepage content can go here */}
        {/* The previous content like "Welcome to Next.js!" has been removed */}
        {/* to make way for the HeroBanner and other dynamic content. */}
        {/* Add a placeholder or new content sections as needed. */}
        {/* For example: */}
        {/* <h2>Featured Products</h2> */}
        {/* <ProductGrid /> */}
      </main>
    </Layout>
  );
}
