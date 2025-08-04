// src/lib/product-utils.ts
import { getProducts, getCategories } from '@/bff/services';

export async function getProductDataForCategory(slug: string) {
  // Fetch all categories
  const categories = await getCategories();
  // Find the current category by slug
  const currentCategory = categories.find(cat => cat.slug === slug);

  // Use the slug for the API call, as the API expects the slug string
  const categoryApiName = slug; // This is the category slug from URL params

  // Use the actual category name if found, otherwise fallback to a formatted slug
  const humanReadableCategoryName = currentCategory?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // TODO: Implement pagination or infinite scroll instead of fetching all products.
  // Using limit: 20 to fetch initial products for SSR.
  const allProductsData = await getProducts({
    category: categoryApiName,
    limit: 20,
  });
  const availableBrands = Array.from(
    new Set(
      allProductsData.items
        .map(p => p.brand)
        .filter((brand): brand is string => typeof brand === 'string' && brand.length > 0) // Type-safe filter
        .sort()
    )
  );

  const initialProducts = allProductsData.items;
  const totalInitialProducts = allProductsData.total;

  return {
    humanReadableCategoryName,
    initialProducts,
    totalInitialProducts,
    availableBrands,
    categoryApiName,
  };
}
