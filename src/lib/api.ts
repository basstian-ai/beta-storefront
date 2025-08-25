/* istanbul ignore file */
import type { Category as ImportedCategory, HeroContent, Product as ImportedProduct } from '@root/types';

// Define Product data structure
export interface Product {
  id: string;
  name: string;
  price: number; // Changed to number for easier manipulation
  brand: string;
  size: string; // Assuming size is a string, e.g., "S", "M", "L", "XL"
  imageUrl: string;
  createdAt: string;
}

// Define Category data structure
export interface Category {
  id: string;
  name: string;
  slug: string;
  // Potentially add description or other fields later
}

// Define Facets data structure
export interface Facets {
  brand: string[];
  size: string[];
  // Add other facet types as needed, e.g., color, priceRange
  // Adding index signature for robust key access, though ActiveFilters is typed from Facets
  [key: string]: string[] | undefined; // <-- This line is modified
}

// Placeholder for the main function we'll build in the next steps
// export const fetchCategoryWithProducts = async (slug: string) => {
//   // ... implementation later
// };

// Define the return type for fetchCategoryWithProducts
export interface CategoryPageData {
  category: Category;
  products: Product[];
  facets: Facets;
}

// Import the mock data from the JSON file
// Note: Ensure tsconfig.json has "resolveJsonModule": true and "esModuleInterop": true (usually default in Next.js)
import MOCK_CATEGORIES_DATA_JSON from '@/bff/data/mock-category-data.json';
import { ActiveFilters } from '@/components/FacetFilters'; // Import ActiveFilters

const applyFiltersToProducts = (
  products: Product[],
  activeFilters: ActiveFilters
): Product[] => {
  if (Object.keys(activeFilters).length === 0) {
    return products;
  }
  return products.filter(product => {
    for (const key in activeFilters) {
      const filterKey = key as keyof Facets; // Assumes keys in ActiveFilters are valid Facet keys
      const selectedValues = activeFilters[filterKey];

      if (!selectedValues || selectedValues.length === 0) {
        continue;
      }

      // Ensure product actually has the property to avoid runtime errors
      if (!product.hasOwnProperty(filterKey)) {
        return false;
      }

      const productValue = product[filterKey as keyof Product]; // Accessing product property

      // Current Product type only has string values for brand & size.
      // If productValue could be array (e.g. tags), this logic would need extension.
      if (typeof productValue !== 'string') {
        // This case should ideally not be hit if Product types and Facet keys are aligned
        // (e.g. product.brand is always string, product.size is always string)
        return false;
      }

      if (!selectedValues.includes(productValue)) {
        return false;
      }
    }
    return true;
  });
};

export const fetchCategoryWithProducts = async (
  slug: string,
  activeFilters?: ActiveFilters,
  sort?: string
): Promise<CategoryPageData | null> => {
  console.log(
    `BFF: Fetching category with products for slug: ${slug}. Filters:`,
    activeFilters || {},
    'Sort:',
    sort
  );

  const allCategoryDataSources: CategoryPageData[] = MOCK_CATEGORIES_DATA_JSON;
  const categoryPageItem = allCategoryDataSources.find(item => item.category.slug === slug);

  if (!categoryPageItem) {
    console.warn(`BFF: Category with slug "${slug}" not found.`);
    return null;
  }

  // Clone data to prevent unintentional modification of the mock data source
  const clonedCategory = { ...categoryPageItem.category };
  let productsToReturn = categoryPageItem.products.map(p => ({ ...p }));
  // Ensure facets are also cloned, especially if they could be modified (though not in this func)
  const clonedFacets = JSON.parse(JSON.stringify(categoryPageItem.facets));

  if (activeFilters && Object.keys(activeFilters).length > 0) {
    console.log(`BFF: Applying filters: `, activeFilters);
    productsToReturn = applyFiltersToProducts(productsToReturn, activeFilters);
    console.log(`BFF: Found ${productsToReturn.length} products after filtering for slug "${slug}".`);
  } else {
    console.log(`BFF: No filters applied, returning all ${productsToReturn.length} products for slug "${slug}".`);
  }

  if (sort === 'price-asc') {
    productsToReturn.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    productsToReturn.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    productsToReturn.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return {
    category: clonedCategory,
    products: productsToReturn,
    facets: clonedFacets, // Return cloned facets
  };
};

export async function fetchCategories(): Promise<ImportedCategory[]> {
  // TODO: Replace with actual BFF endpoint later
  const res = await fetch('https://dummyjson.com/products/categories');
  if (!res.ok) {
    // Log the error for server-side visibility
    console.error('Failed to fetch categories:', res.status, await res.text());
    throw new Error('Failed to fetch categories');
  }
  const data = await res.json();

  // Ensure data is an array before mapping
  if (Array.isArray(data)) {
    return data.map((categoryData: unknown) => { // Changed categoryName to categoryData, type to unknown
      if (typeof categoryData === 'string') {
        return {
          id: categoryData,
          name: categoryData,
          slug: categoryData.toLowerCase().replace(/\s+/g, '-'),
        };
      } else if (
        typeof categoryData === 'object' &&
        categoryData !== null &&
        'name' in categoryData && typeof (categoryData as { name: unknown }).name === 'string' &&
        'slug' in categoryData && typeof (categoryData as { slug: unknown }).slug === 'string'
      ) {
        // If the API returns objects with name and slug properties
        const catObj = categoryData as { name: string; slug: string; id?: string | number }; // Type assertion
        return {
          id: catObj.id || catObj.slug,
          name: catObj.name,
          slug: catObj.slug,
        };
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unexpected category format:', categoryData);
        }
        return null;
      }
    }).filter(Boolean) as ImportedCategory[]; // Filter out nulls and assert type to ImportedCategory
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Fetched data is not an array:', data);
    }
    return [];
  }
}

export async function fetchFeaturedProducts(): Promise<ImportedProduct[]> {
  const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com';
  const res = await fetch(`${CMS_BASE_URL}/products?limit=6`); // DummyCMS format
  if (!res.ok) throw new Error('Failed to fetch featured products');

  const json = await res.json();
  // Define a minimal type for products from dummyjson for this function
  type DummyJsonProductListItem = { id: number | string; title: string; price: number; thumbnail: string };
  return (json.products || []).map((p: DummyJsonProductListItem) => ({
    id: String(p.id), // Ensure id is string
    name: p.title,
    slug: String(p.id), // Use id as slug for simplicity with dummyjson
    price: p.price,
    imageUrl: p.thumbnail,
    // Ensure other ImportedProduct fields that are non-optional have fallbacks or are mapped
    brand: '', // Example: add fallback for missing fields in ImportedProduct
    category: '', // Example
    description: '', // Example
    effectivePrice: { amount: p.price, currencyCode: 'USD' }, // Example
    images: [], // Example
    rating: 0, // Example
    stock: 0, // Example
    createdAt: new Date().toISOString(), // Example - this is likely not what ImportedProduct expects for createdAt
  })).filter(p => p !== null) as ImportedProduct[]; // Added filter and assertion
}

export async function fetchSearchResults(query: string): Promise<Product[]> { // Local Product type
  const CMS_BASE_URL =
    process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com';
  const res = await fetch(
    `${CMS_BASE_URL}/products/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  const json = await res.json();
  const productsArray = Array.isArray(json.products) ? json.products : [];
  // Define a minimal type for products from dummyjson search for this function
  type DummyJsonSearchProduct = {
    id: number | string;
    title: string;
    price: number;
    brand?: string;
    // size is not a standard dummyjson field, assuming it might be missing or added via transformation elsewhere
    thumbnail?: string;
    createdAt?: string; // Assuming createdAt might be directly from API or transformed
  };
  return productsArray.map((p: DummyJsonSearchProduct) => ({
    id: String(p.id) || '', // Ensure id is string
    name: p.title,
    price: p.price,
    brand: p.brand || 'Unknown Brand', // Provide fallback
    size: '', // Provide fallback as 'size' is not in DummyJsonSearchProduct but in local Product
    imageUrl: p.thumbnail || '', // Provide fallback
    createdAt: p.createdAt || new Date().toISOString(), // Provide fallback
  }));
}

export async function fetchProductById(
  id: string
): Promise<ImportedProduct | null> {
  const CMS_BASE_URL =
    process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com';
  const res = await fetch(`${CMS_BASE_URL}/products/${id}`);
  if (!res.ok) {
    console.error('Failed to fetch product', id, res.status);
    return null;
  }
  const p = await res.json();
  return {
    id: p.id?.toString() || '',
    name: p.title,
    slug: p.id?.toString() || '',
    price: p.price,
    imageUrl: p.thumbnail,
    createdAt: p.createdAt || '',
  };
}

// Placeholder for CMS_BASE_URL, should be set in environment variables
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com'; // Using NEXT_PUBLIC_ prefix for client-side access if needed, or just process.env for server-side. For getStaticProps, process.env is fine.

export async function fetchHeroBanner(): Promise<HeroContent> {
  // Simulate fetching hero banner data from a CMS
  const response = await fetch(`${CMS_BASE_URL}/products/1`); // Using a product endpoint for dummy data

  if (!response.ok) {
    // Log the error for server-side debugging
    console.error('Failed to fetch hero banner data:', response.status, response.statusText);
    // Throw an error that can be caught by getStaticProps
    throw new Error('Failed to fetch hero banner content. Please check server logs for details.');
  }

  const product = await response.json();

  // Adapt the product data to HeroContent
  const heroData: HeroContent = { // Explicitly type the return
    title: product.title || 'Amazing Product!',
    description: product.description || 'Check out this incredible offer.',
    ctaText: 'Learn More',
    ctaLink: `/products/${product.id}`, // Example CTA link
    imageUrl: product.thumbnail || 'https://via.placeholder.com/600x400.webp?text=Hero+Image', // Fallback placeholder
    imageAlt: product.title ? `Image for ${product.title}` : undefined // Ensure it aligns with optional imageAlt
  };
  return heroData;
}

// Add other existing API functions if any, or keep the file clean if it's new.
// For example, if there was an existing function like:
// export async function fetchProducts() { ... }
// It should be preserved.

// To ensure the file can be read and check its current content (if any):
// console.log("Current content of lib/api.ts will be preserved and fetchHeroBanner added/updated.");

export async function fetchFeaturedCategories(): Promise<ImportedCategory[]> {
  const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL || 'https://dummyjson.com';

  // The issue mentions /categories or /featured-categories.
  // Checking common patterns for dummyjson, products are under /products, users under /users.
  // It's likely categories are under /products/categories or just /products/category/some-category-name
  // or /categories if it's a dedicated endpoint.
  // dummyjson.com provides a /products/categories endpoint which returns a list of category names (strings).
  // And a /products/category/{slug} which returns products for a category.
  // For the purpose of this task, we need a list of category *objects*.
  // Let's try /products/categories first and see the structure. If it's just strings, we'll need to adapt.
  // The issue implies the endpoint returns objects with id, name, slug, image.
  // dummyjson.com /products returns products which have a category field (string).
  // It seems dummyjson.com doesn't have a direct equivalent of a "featured categories" endpoint that provides image URLs for categories.
  // Let's use /products as a source and derive categories from them, simulating a richer category object.
  // This is a common workaround when a direct endpoint isn't available.

  const response = await fetch(`${CMS_BASE_URL}/products?limit=5`); // Fetch a few products to get diverse categories
  if (!response.ok) throw new Error('Failed to fetch products for categories');

  const data = await response.json();

  // Assuming data.products is an array of product objects
  if (!data.products || !Array.isArray(data.products)) {
    console.error('Unexpected data structure from /products endpoint:', data);
    throw new Error('Failed to parse products for categories');
  }

  // Extract unique categories from the products
  const categoriesMap = new Map<string, ImportedCategory>();
  // Define a minimal type for products from dummyjson for this specific forEach
  type ProductWithCategory = { category: string; thumbnail?: string; };
  data.products.forEach((product: ProductWithCategory) => {
    if (product.category) {
      const slug = product.category.toLowerCase().replace(/\s+/g, '-');
      if (!categoriesMap.has(slug)) {
        categoriesMap.set(slug, {
          id: slug, // Use slug as ID if no specific ID is provided
          name: product.category,
          slug: slug,
          // dummyjson products have a 'thumbnail' and 'images' array. Let's use thumbnail for category image.
          imageUrl: product.thumbnail || `https://via.placeholder.com/150?text=${encodeURIComponent(product.category)}`,
        });
      }
    }
  });

  const uniqueCategories = Array.from(categoriesMap.values());

  // If the CMS_BASE_URL is dummyjson, it has a /products/categories endpoint which returns string array.
  // Let's refine this: if the direct /categories endpoint exists and returns the expected structure, use that.
  // The original plan was: const response = await fetch(`${CMS_BASE_URL}/categories`);
  // Let's assume for now that a /categories endpoint exists and returns something like:
  // [{ "id": "1", "name": "Electronics", "slug": "electronics", "image": "url..." }]
  // If not, the product derivation logic above is a fallback.
  // The issue statement's `fetchFeaturedCategories` uses `/categories`. We should stick to that first.

  const categoriesResponse = await fetch(`${CMS_BASE_URL}/categories`);
  if (!categoriesResponse.ok) {
    // Fallback to deriving from products if /categories fails or isn't as expected
    console.warn('Failed to fetch from /categories, attempting to derive from /products');
    return uniqueCategories.length > 0 ? uniqueCategories : []; // Return derived if available, else empty
  }

  const cmsCategoriesData = await categoriesResponse.json();

  // Check if cmsCategoriesData is an array and has the expected structure
  // dummyjson.com/categories returns ["smartphones","laptops","fragrances","skincare","groceries","home-decoration"]
  // This is an array of strings, not objects.
  // So we must map these strings to the Category type.
  if (Array.isArray(cmsCategoriesData) && cmsCategoriesData.every(item => typeof item === 'string')) {
    return cmsCategoriesData.map((categoryName: string, index: number): ImportedCategory => { // Added return type
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      return {
        id: `${index + 1}`, // Assign a simple ID
        name: categoryName,
        slug: slug,
        imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(categoryName)}`, // Placeholder image
      };
    });
  } else if (Array.isArray(cmsCategoriesData) && cmsCategoriesData.length > 0 && typeof cmsCategoriesData[0] === 'object' && 'name' in cmsCategoriesData[0]) {
    // This branch assumes the /categories endpoint returns objects like [{id, name, slug, image}]
    type CmsCategoryObject = { id?: string | number; name: string; slug?: string; image?: string; imageUrl?: string; };
    return cmsCategoriesData.map((cat: CmsCategoryObject): ImportedCategory => ({
      id: String(cat.id || cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')), // Prioritize given ID, then slug, then generate from name
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      imageUrl: cat.image || cat.imageUrl || `https://via.placeholder.com/150?text=${encodeURIComponent(cat.name)}`,
    }));
  } else {
    // If the structure is unexpected, fall back to deriving from products or return empty
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Unexpected data structure from /categories. Falling back to product-derived categories or empty array.');
    }
    return uniqueCategories.length > 0 ? uniqueCategories : [];
  }
}
