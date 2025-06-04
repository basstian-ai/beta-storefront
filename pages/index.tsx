import Head from 'next/head';
import Layout from '@/components/Layout';
import HeroBanner from '@/components/HeroBanner';
import FeaturedCategories from '@/components/FeaturedCategories'; // Import FeaturedCategories
import FeaturedProductsCarousel from '@/components/FeaturedProductsCarousel'; // Added this import
import { fetchHeroBanner, fetchCategories, fetchFeaturedCategories, fetchFeaturedProducts } from '@/lib/api'; // Added fetchFeaturedProducts
import type { HeroContent, Category, Product } from '@/types'; // Added Product
import styles from '../styles/Home.module.css';

type HomePageProps = {
  hero?: HeroContent; // Optional due to potential fetch error
  categories?: Category[]; // Optional
  featuredCategories?: Category[]; // Optional
  featuredProducts?: Product[]; // Added featuredProducts, optional
  error?: string | null;
};

export async function getStaticProps(): Promise<{ props: HomePageProps, revalidate?: number }> {
  let hero: HeroContent | undefined;
  let categories: Category[] = [];
  let featuredCategories: Category[] = [];
  let featuredProducts: Product[] = [];
  let error: string | null = null;

  try {
    // Parallel fetching might be an option here if API calls are independent
    hero = await fetchHeroBanner();
    categories = await fetchCategories();
    featuredCategories = await fetchFeaturedCategories();
    featuredProducts = await fetchFeaturedProducts(); // Added this line
  } catch (err: any) {
    console.error("Error fetching page data for HomePage:", err.message || err);
    error = 'Some content failed to load. Please try again later.';
    // Initialize all data to safe defaults or empty arrays if an error occurs
    // Hero might use a fallback if critical, others can be empty.
    if (!hero) { // If hero failed specifically or due to general error
        hero = {
            title: 'Welcome to Our Store!',
            description: 'We are currently unable to load the latest offers. Please check back soon.',
            ctaText: 'Explore Products',
            ctaLink: '/products',
            imageUrl: 'https://via.placeholder.com/1200x400.png?text=Our+Store',
            imageAlt: 'Default hero image'
        };
    }
    // categories, featuredCategories, featuredProducts will be [] if their fetch failed or due to general error
  }

  return {
    props: {
      hero,
      categories,
      featuredCategories,
      featuredProducts, // Added this prop
      error,
    },
    revalidate: 60, // Revalidate at most once per minute
  };
}

export default function HomePage({ hero, categories, featuredCategories, featuredProducts, error }: HomePageProps) { // Added featuredProducts
  return (
    <Layout categories={categories || []}>
      <Head>
        <title>Home Page</title>
        <meta name="description" content="Welcome to our e-commerce store." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {hero && <HeroBanner {...hero} />}

      <main className={styles.main}>
        {/* Render FeaturedCategories if there are any */}
        {featuredCategories && featuredCategories.length > 0 && (
          <FeaturedCategories categories={featuredCategories} />
        )}
        {/* Render FeaturedProductsCarousel if there are products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <FeaturedProductsCarousel products={featuredProducts} />
        )}
        {/* Other homepage content */}
      </main>
    </Layout>
  );
}
