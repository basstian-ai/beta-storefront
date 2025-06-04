// pages/category/[slug].tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProductList from '@/components/ProductList'; // Corrected import: default export
import FacetFilters, { ActiveFilters } // Import ActiveFilters and FacetFilters
    from '@/components/FacetFilters';
import { GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import {
  fetchCategoryWithProducts,
  CategoryPageData,
  Facets
} from '@/lib/api';
// Removed filterProducts import
import { useState, useEffect } from 'react';
import styles from '@/styles/CategoryPage.module.css';

interface CategoryPageParams extends ParsedUrlQuery {
  slug: string;
}

interface CategoryPageProps {
  initialCategoryData: CategoryPageData | null;
  initialSlug: string;
}

const CategoryPage = ({ initialCategoryData, initialSlug }: CategoryPageProps) => {
  const router = useRouter();

  const [displayedCategoryData, setDisplayedCategoryData] = useState<CategoryPageData | null>(initialCategoryData);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Effect for URL to State synchronization
  useEffect(() => {
    if (router.isReady) { // Ensure router.query is populated
      const currentQuery = router.query;
      const newActiveFilters: ActiveFilters = {};
      let hasFiltersFromQuery = false;

      for (const key in currentQuery) {
        if (key !== 'slug') { // Exclude non-filter params like 'slug'
          const value = currentQuery[key];
          if (typeof value === 'string') {
            // Assuming keys in query are valid Facet keys
            newActiveFilters[key as keyof Facets] = value.split(',');
            hasFiltersFromQuery = true;
          }
          // Add handling for string[] if not using comma-separated, but we are.
        }
      }

      // Only set if there are actual filters from query and they differ from current state
      // This prevents an extra render cycle if filters are already empty or match
      if (hasFiltersFromQuery || Object.keys(activeFilters).length > 0) {
         // Simple comparison for now, can be deep comparison if needed
        if (JSON.stringify(activeFilters) !== JSON.stringify(newActiveFilters)) {
            setActiveFilters(newActiveFilters);
        }
      }
    }
  }, [router.isReady, router.query, activeFilters]); // Added activeFilters to dep array for the stringify comparison


  // Effect for State to URL synchronization
  useEffect(() => {
    if (!router.isReady) return;
    const queryParams = new URLSearchParams();
    let hasFilters = false;
    for (const key in activeFilters) {
      const filterKey = key as keyof ActiveFilters;
      const values = activeFilters[filterKey];
      if (values && values.length > 0) {
        queryParams.set(filterKey, values.join(','));
        hasFilters = true;
      }
    }
    const currentSlugFromRouter = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
    const currentSlug = currentSlugFromRouter || initialSlug;

    const newPath = `/category/${currentSlug}${hasFilters ? `?${queryParams.toString()}` : ''}`;
    if (router.asPath !== newPath) {
      router.replace(newPath, undefined, { shallow: true });
    }
  }, [activeFilters, router.isReady, router.asPath, router.query.slug, initialSlug]);


  // Effect for fetching data when activeFilters or slug changes
  useEffect(() => {
    const currentSlugFromRouter = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
    const slugToFetch = currentSlugFromRouter || initialSlug;

    if (!slugToFetch || !router.isReady) { // Ensure router is ready before fetching based on its query params
        // If not ready, and we have initial data, we can rely on that, or wait.
        // If initialSlug is present, it might be an initial server render without client router being ready.
        // For client-side fetches triggered by filter changes, router.isReady should be true.
        if(!initialSlug && !slugToFetch) return; // Avoid fetching if no slug is determined
    }

    // Only fetch if activeFilters is populated or if it's the initial load with initialSlug
    // This condition is tricky: we want to fetch on initial load (handled by getStaticProps)
    // and then on subsequent filter changes.
    // The main trigger should be activeFilters changing *after* initial URL parse.
    // Or slug changing.

    // Let's simplify: if slugToFetch is valid, proceed.
    // The initial data is already in displayedCategoryData.
    // This effect should primarily run for CHANGES in activeFilters or slug derived from router.

    // Avoid fetching if it's the very first render and activeFilters is still empty
    // and we are using initialCategoryData. Let URL-to-State populate activeFilters first.
    if (Object.keys(activeFilters).length === 0 && displayedCategoryData === initialCategoryData && !router.query.brand && !router.query.size) {
        // This condition attempts to prevent an immediate re-fetch if initial data is already set
        // and no filters are in the URL initially.
        // It might need refinement based on exact timing and router.isReady behavior.
    } else {
        setIsLoading(true);
        fetchCategoryWithProducts(slugToFetch, activeFilters)
          .then(data => {
            setDisplayedCategoryData(data);
          })
          .catch(error => {
            console.error("Error fetching category data client-side:", error);
            setDisplayedCategoryData(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
    }

  }, [activeFilters, initialSlug, router.query.slug, router.isReady]); // router.isReady added


  const handleFilterChangeCallback = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters);
  };

  const toggleMobileFilters = () => setIsMobileFiltersOpen(!isMobileFiltersOpen);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileFiltersOpen) setIsMobileFiltersOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileFiltersOpen]);

  if (router.isFallback && !displayedCategoryData) {
    return <div>Loading page structure...</div>;
  }

  if (!displayedCategoryData || !displayedCategoryData.category) {
    if (isLoading) return <div>Loading initial category data...</div>; // Or a more specific loading state
    return (
      <Layout categories={[]}>
        <div className={styles.pageContainer}><h1>Category not found</h1><p>Could not find category data for slug: {initialSlug}</p></div>
      </Layout>
    );
  }

  const { category, products, facets } = displayedCategoryData;

  return (
    <Layout categories={[]}>
      <div className={styles.pageContainer}>
        <h1>Category: {category.name}</h1>
        {isLoading && <p /*className={styles.loadingIndicator}*/>Loading products...</p>}
        <button className={styles.mobileFilterButton} onClick={toggleMobileFilters}>
          {isMobileFiltersOpen ? 'Hide' : 'Show'} Filters
        </button>
        <div className={styles.mainContentArea}>
          <aside className={`${styles.filterSidebar} ${!isMobileFiltersOpen ? styles.mobileHidden : ''}`}>
            <FacetFilters
              facets={facets}
              onFilterChange={handleFilterChangeCallback}
              initialActiveFilters={activeFilters}
            />
          </aside>
          <main className={styles.productListArea}>
            {!isLoading && <ProductList products={products} />}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<CategoryPageParams>
): Promise<GetStaticPropsResult<CategoryPageProps>> {
  const slug = context.params?.slug;
  if (!slug) return { notFound: true };

  // Fetch initial data without filters for getStaticProps
  const categoryData = await fetchCategoryWithProducts(slug);

  if (!categoryData) return { notFound: true };

  return {
    props: {
      initialCategoryData: categoryData, // Changed from categoryData
      initialSlug: slug, // Changed from slug
    },
    revalidate: 60, // Optional: revalidate every 60 seconds
  };
}

export default CategoryPage;
