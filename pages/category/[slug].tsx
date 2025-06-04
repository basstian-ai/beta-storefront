// pages/category/[slug].tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProductList from '@/components/ProductList'; // Corrected import: default export
import FacetFilters, { ActiveFilters } // Import ActiveFilters and FacetFilters
    from '@/components/FacetFilters';
import {
  fetchCategoryWithProducts,
  CategoryPageData,
  Product,
  Category,
  Facets
} from '@/lib/api';
import { filterProducts } from '@/lib/filterUtils'; // Import the new utility
import { useState, useEffect, useMemo } from 'react'; // Added useMemo, useEffect might not be needed now

// Props type for the page (ensure it aligns with getStaticProps)
interface CategoryPageProps {
  // categoryData will hold all data from fetchCategoryWithProducts
  categoryData: CategoryPageData | null;
  slug: string; // slug might be part of categoryData.category but passed for clarity
}

const CategoryPage = ({ categoryData, slug }: CategoryPageProps) => {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  // The full list of products for the category, fetched once.
  const allProducts = categoryData?.products || [];
  // Provide default empty facets if not present in categoryData
  const facetsData = categoryData?.facets || { brand: [], size: [] } as Facets;


  // Memoize the filtered products list to avoid re-filtering on every render
  // unless allProducts or activeFilters change.
  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts, activeFilters);
  }, [allProducts, activeFilters]);

  const handleFilterChange = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters);
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!categoryData || !categoryData.category) {
    // This case should ideally be handled by getStaticProps returning notFound: true
    // and Next.js rendering the 404 page.
    // If it reaches here, it's an unexpected state or getStaticProps needs adjustment.
    return (
      <Layout>
        <div>
          <h1>Category not found</h1>
          <p>Could not find category data for slug: {slug}</p>
        </div>
      </Layout>
    );
  }

  const { category } = categoryData;

  return (
    <Layout>
      <div>
        <h1>Category: {category.name}</h1>
        {/* Optional: <p>{category.description}</p> if description is part of Category type */}

        <div style={{ display: 'flex', gap: '20px' }}> {/* Basic layout for filters and products */}
          <aside style={{ width: '250px' }}> {/* Placeholder style for filter sidebar */}
            <FacetFilters
              facets={facetsData}
              onFilterChange={handleFilterChange}
            />
          </aside>
          <main style={{ flex: 1 }}>
            {/* Pass the filtered list of products to ProductList */}
            <ProductList products={filteredProducts} />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticPaths() {
  // For mock data, let's assume lib/api.ts or a data source can provide slugs
  // This part might need adjustment if MOCK_CATEGORIES_DATA is not directly accessible here
  // For now, keeping it simple, assuming a way to get slugs or dynamic fallback.
  // const paths = (await someFunctionToGetAllCategorySlugs()).map(slug => ({ params: { slug } }));
  // For this example, we'll use the slugs from the previous mock data in [slug].tsx itself.
  // This should ideally come from a BFF call or a shared data source.
  // Let's simulate with a few known slugs if direct data access is complex here.
   const knownSlugs = ['electronics', 'apparel']; // From our mock data
   const paths = knownSlugs.map(slug => ({ params: { slug } }));
  return { paths, fallback: 'blocking' }; // fallback: 'blocking' or true
}

export async function getStaticProps({ params }) {
  const slug = params?.slug as string;

  if (!slug) {
    return { notFound: true };
  }

  const categoryData = await fetchCategoryWithProducts(slug);

  if (!categoryData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      categoryData,
      slug,
    },
    revalidate: 60, // Optional: revalidate every 60 seconds
  };
}

export default CategoryPage;
