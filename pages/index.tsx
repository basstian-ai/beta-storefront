import Head from 'next/head';
import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import FeaturedCategories from '@/components/FeaturedCategories'; // Import FeaturedCategories
import { fetchHeroBanner, fetchCategories, fetchFeaturedCategories } from '@/lib/api'; // Added fetchFeaturedCategories
import type { HeroContent, Category } from '@/types';
import styles from '../styles/Home.module.css';

type HomePageProps = {
  hero: HeroContent;
  categories: Category[];
  featuredCategories: Category[]; // Added featuredCategories
  error?: string | null;
};

export async function getStaticProps(): Promise<{ props: HomePageProps, revalidate?: number }> {
  let heroData: HeroContent;
  let categories: Category[] = [];
  let featuredCategories: Category[] = []; // Initialize featuredCategories
  let error: string | null = null;

  try {
    // Fetch categories and featured categories
    // Making these fetches non-critical for page load, but logging errors.
    try {
      categories = await fetchCategories();
    } catch (catError: any) {
      console.error("Error fetching categories:", catError.message || catError);
      // categories remains [], page can still render
    }

    try {
      featuredCategories = await fetchFeaturedCategories();
    } catch (featCatError: any) {
      console.error("Error fetching featured categories:", featCatError.message || featCatError);
      // featuredCategories remains [], page can still render
    }

    // Hero data is critical, if this fails, we use fallback.
    heroData = await fetchHeroBanner();

    return {
      props: {
        hero: heroData,
        categories,
        featuredCategories, // Add to props
        error: null,
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

    // Categories and featuredCategories should have their data or be empty arrays
    // from their own try/catch blocks, even if hero fetching fails.

    return {
      props: {
        hero: heroData, // Use fallback hero data
        categories,
        featuredCategories, // Add to props even in error case (will be [] if fetch failed)
        error,
      },
      revalidate: 60,
    };
  }
}

export default function HomePage({ hero, categories, featuredCategories, error }: HomePageProps) { // Added featuredCategories
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
        {/* Render FeaturedCategories if there are any */}
        {featuredCategories && featuredCategories.length > 0 && (
          <FeaturedCategories categories={featuredCategories} />
        )}
        {/* Other homepage content */}
      </main>
    </Layout>
  );
}
