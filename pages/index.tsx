import Head from 'next/head';
import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import { fetchHeroBanner, fetchCategories } from '@/lib/api';
import type { HeroContent, Category } from '@/types';
import styles from '../styles/Home.module.css';

type HomePageProps = {
  hero: HeroContent;
  categories: Category[];
  error?: string | null; // Allow error to be string or null
};

export async function getStaticProps(): Promise<{ props: HomePageProps, revalidate?: number }> {
  let heroData: HeroContent;
  let categories: Category[] = []; // Initialize categories
  let error: string | null = null; // Initialize error to null

  try {
    // Fetch categories first or in parallel if independent
    // Making category fetch non-critical for page load, but logging error.
    try {
      categories = await fetchCategories();
    } catch (catError: any) {
      console.error("Error fetching categories:", catError.message || catError);
      // categories remains [], page can still render with empty categories or Layout handles it.
    }

    // Hero data is critical, if this fails, we use fallback.
    heroData = await fetchHeroBanner();

    return {
      props: {
        hero: heroData,
        categories,
        error: null, // Explicitly set error to null on success
      },
      revalidate: 60,
    };
  } catch (fetchError: any) { // This primarily catches errors from fetchHeroBanner
    console.error("Error fetching hero data for HomePage:", fetchError.message || fetchError);
    error = fetchError.message || 'Failed to load hero banner data.';

    // Fallback hero data is assigned here
    heroData = {
      title: 'Welcome to Our Store!',
      description: 'We are currently unable to load the latest offers. Please check back soon.',
      ctaText: 'Explore Products',
      ctaLink: '/products',
      imageUrl: 'https://via.placeholder.com/1200x400.png?text=Our+Store',
      imageAlt: 'Default hero image'
    };

    // If categories array is still empty (e.g., initial fetch failed or was skipped due to hero error path),
    // we might attempt to fetch them again, or ensure it's passed as potentially empty.
    // The current logic already fetches categories outside this main catch block for hero,
    // so categories should have its data or be an empty array from its own try/catch.

    return {
      props: {
        hero: heroData, // Use fallback hero data
        categories, // Pass categories fetched (or empty from its own try/catch)
        error, // Pass the error message string
      },
      revalidate: 60,
    };
  }
}

export default function HomePage({ hero, categories, error }: HomePageProps) {
  return (
    <Layout categories={categories}>
      <Head>
        <title>Home Page</title>
        <meta name="description" content="Welcome to our e-commerce store." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <HeroBanner {...hero} />

      <main className={styles.main}>
        {/* Other homepage content */}
      </main>
    </Layout>
  );
}
