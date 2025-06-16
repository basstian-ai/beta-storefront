// src/app/category/[slug]/page.tsx
import { getProducts, getCategories } from '@/bff/services';
// ProductSchema will be used by the client component
// Link will be used by client component
// z will be used by client component
import CategoryFilterableProducts from '@/components/CategoryFilterableProducts'; // Import the new client component
import Link from 'next/link'; // Keep for fallback link

// ProductCard component will be moved to CategoryFilterableProducts.tsx or a shared components directory

export async function generateStaticParams() {
  console.log("Attempting to generate static params for category pages...");
  try {
    const categories = await getCategories(); // Should be Array<{ id, name, slug }>

    if (!Array.isArray(categories)) {
      console.error("generateStaticParams: categories is not an array. Received:", categories);
      throw new Error("Categories data is not an array.");
    }

    console.log(`generateStaticParams: Received ${categories.length} categories.`);

    return categories.map((category, index) => {
      if (typeof category !== 'object' || category === null) {
        console.error(`generateStaticParams: Category at index ${index} is not an object. Received:`, category);
        throw new Error(`Invalid category item at index ${index} (not an object).`);
      }
      if (typeof category.slug !== 'string') {
        console.error(`generateStaticParams: Category slug at index ${index} is not a string. Received:`, category.slug, "Full category object:", category);
        // Attempt to recover or provide a default to see if build passes, though this hides the root cause
        // For now, let's throw to ensure the error is caught.
        throw new Error(`Invalid category slug at index ${index} (not a string). Slug: ${category.slug}`);
      }
      console.log(`generateStaticParams: Processing category slug: ${category.slug}`); // Enhanced logging
      return {
        slug: category.slug,
      };
    });
  } catch (error) {
    // Log the error with more context if possible
    if (error instanceof Error) {
      console.error("Failed to generate static params for category pages:", error.message, error.stack);
    } else {
      console.error("Failed to generate static params for category pages (unknown error type):", error);
    }
    return [];
  }
}

// Removed CategoryPageProps interface

export default async function CategoryPage({
  params,
  // searchParams, // Removed as it's not used directly in this Server Component
}: {
  params: { slug: string };
  // searchParams?: { // Type definition also removed
  //   brand?: string;
  //   minPrice?: string;
  //   maxPrice?: string;
  //   sort?: 'price-asc' | 'price-desc' | 'newest';
  // };
}) {
  const { slug } = params;

  // Fetch all categories
  const categories = await getCategories();
  // Find the current category by slug
  const currentCategory = categories.find(cat => cat.slug === slug);

  // Use the slug for the API call, as the API expects the slug string
  const categoryApiName = slug; // This is the category slug from URL params

  // Use the actual category name if found, otherwise fallback to a formatted slug
  const humanReadableCategoryName = currentCategory?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Fetch all products for this category to derive available brands
  // Using limit: 0 to signify fetching all products (adapter might need to handle this if API has max limit)
  const allProductsData = await getProducts({
    category: categoryApiName,
    limit: 0,
  });
  const availableBrands = Array.from(
    new Set(
      allProductsData.items
        .map(p => p.brand)
        .filter((brand): brand is string => typeof brand === 'string' && brand.length > 0) // Type-safe filter
        .sort()
    )
  );

  // Pass all products for client-side filtering initially, until BFF is updated for multi-brand.
  // This is not ideal for large categories but fulfills the current structure.
  // totalInitialProducts will be the total for the category.
  const initialProducts = allProductsData.items;
  const totalInitialProducts = allProductsData.total;

  // Fallback for no products (applies if the category has no products at all)
  if (!initialProducts || initialProducts.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Category: {humanReadableCategoryName}</h1>
        <p>No products found in this category.</p>
        <Link href="/" className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <CategoryFilterableProducts
      initialProducts={initialProducts}
      totalInitialProducts={totalInitialProducts}
      availableBrands={availableBrands}
      categorySlug={categoryApiName}
      initialHumanReadableCategoryName={humanReadableCategoryName}
      // searchParams are not directly passed; client component uses useSearchParams
    />
  );
}
