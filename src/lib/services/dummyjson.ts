// src/bff/adapters/dummyjson.ts

const API_BASE_URL = 'https://dummyjson.com';

// Helper to transform a category slug string into a Category-like object (name/slug)
const transformCategoryStringToObject = (categorySlug: string): { slug: string; name: string } => {
  if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
    // This case should ideally not happen if DummyJSON product data is consistent
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Invalid category slug encountered: "${categorySlug}". Using default.`);
    }
    return {
      slug: categorySlug || 'unknown',
      name: 'Unknown Category'
    };
  }
  return {
    slug: categorySlug,
    name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
};

import { z } from 'zod';
// Import GetProductsOptions type
import { GetProductsOptions } from '../types';

// Schema for DummyJSON /auth/login API actual response
// This schema now reflects the actual API response including accessToken and refreshToken
export const DummyJsonLoginApiSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(), // Per docs, can be 'male', 'female', etc.
  image: z.string().url(),
  accessToken: z.string(), // DummyJSON provides accessToken
  refreshToken: z.string(), // DummyJSON provides refreshToken
}).passthrough(); // Allow other fields from DummyJSON without error

// Minimal interface for raw product data from DummyJSON before Zod parsing
interface DummyJsonProductRaw {
  id: number;
  title: string; // Though not directly used in map/filter, it's part of the object
  price: number;
  brand?: string;
  category: string; // Initially a string from DummyJSON
  // Add other fields if they are directly accessed in map/filter before Zod parsing
  // For example, if sorting used other raw fields:
  // rating?: number;
}

interface DummyJsonResponse {
  products: DummyJsonProductRaw[]; // Use DummyJsonProductRaw for the items in the products array
  total: number;
  skip: number;
  limit: number;
}

export async function fetchProducts(options: GetProductsOptions = {}) {
  const { category, limit, skip, sort, brands, minPrice, maxPrice } = options;
  let url = `${API_BASE_URL}/products`;

  // Determine if we need to fetch all products for client-side filtering/pagination
  let fetchAllForManualFiltering = false;
  if ((brands && brands.length > 0) || minPrice !== undefined || maxPrice !== undefined) {
    fetchAllForManualFiltering = true;
  }

  let fetchLimit = limit;
  let fetchSkip = skip;

  // DummyJSON API does not support sorting by price or newest (ID).
  // 'relevance' will be the default API order.
  // We will fetch data then sort manually if needed.
  // So, the 'sort' option from GetProductsOptions will not be passed as a query param to DummyJSON.

  if (category) {
    url = `${API_BASE_URL}/products/category/${category}`;
    if (fetchAllForManualFiltering || sort && sort !== 'relevance') { // Also fetch all if manual sort is needed
      fetchLimit = 0; // Fetch all for this category for manual filtering/sorting
      fetchSkip = undefined;
    }
  } else if (fetchAllForManualFiltering || sort && sort !== 'relevance') {
    // No category, but filters or manual sort specified. Fetch all products.
    fetchLimit = 0; // Fetch all products
    fetchSkip = undefined;
  }

  const queryParams = new URLSearchParams();
  if (fetchLimit !== undefined) queryParams.append('limit', String(fetchLimit));
  if (fetchSkip !== undefined) queryParams.append('skip', String(fetchSkip));
  // Do not append `sort` here; manual sorting will be applied later.

  if (queryParams.toString()) {
    url += (url.includes('?') ? '&' : '?') + queryParams.toString();
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Adapter.fetchProducts] Fetching URL: ${url}`);
  }

  let data: DummyJsonResponse;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { products: [], total: 0, skip: 0, limit: 0 } as DummyJsonResponse;
    }
    data = await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchProducts] Network error', err);
    }
    return { products: [], total: 0, skip: 0, limit: 0 } as DummyJsonResponse;
  }

  // Transform category string to object for each product
  if (data.products && Array.isArray(data.products)) {
    // Type products from API before Zod parsing, if needed for intermediate steps
    data.products = data.products.map((product: DummyJsonProductRaw) => ({
      ...product,
      category: transformCategoryStringToObject(product.category), // transformCategoryStringToObject expects string
    }));

    let filteredProducts: DummyJsonProductRaw[] = data.products; // Now an array of typed raw products

    // Client-side filtering for brands if brands are specified
    if (brands && brands.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] Before brand filter: ${filteredProducts.length} products.`);
      }
      filteredProducts = filteredProducts.filter((product: DummyJsonProductRaw) =>
        product.brand && brands.includes(product.brand)
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] After brand filter: ${filteredProducts.length} products.`);
      }
    }

    // Client-side filtering for price range
    if (minPrice !== undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] Before minPrice filter (${minPrice}): ${filteredProducts.length} products.`);
      }
      filteredProducts = filteredProducts.filter((product: DummyJsonProductRaw) => product.price >= minPrice);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] After minPrice filter: ${filteredProducts.length} products.`);
      }
    }
    if (maxPrice !== undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] Before maxPrice filter (${maxPrice}): ${filteredProducts.length} products.`);
      }
      filteredProducts = filteredProducts.filter((product: DummyJsonProductRaw) => product.price <= maxPrice);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] After maxPrice filter: ${filteredProducts.length} products.`);
      }
    }

    // Apply sorting after filtering
    if (sort && sort !== 'relevance') {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] Before sorting by "${sort}": ${filteredProducts.length} products.`);
      }
      if (sort === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        filteredProducts.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
      }
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Adapter.fetchProducts] After sorting: ${filteredProducts.length} products.`);
      }
    }

    data.products = filteredProducts;
    // Update total to reflect filtered count (after filtering, before pagination).
    data.total = filteredProducts.length;

    // Apply manual pagination if we fetched all (due to any filtering or manual sorting)
    const needsManualPagination = (fetchAllForManualFiltering || (sort && sort !== 'relevance'));
    if (needsManualPagination && limit !== undefined && limit > 0) {
       const actualSkip = skip || 0;
       data.products = filteredProducts.slice(actualSkip, actualSkip + limit);
       data.skip = actualSkip; // Reflect the manual skip
       data.limit = data.products.length; // Reflect the actual number of items returned after slice
    } else if (!needsManualPagination) {
      // If API did pagination, ensure skip/limit from API response are respected
      // data.skip and data.limit would already be from API response.
      // data.limit should reflect the actual number of items returned by API.
      data.limit = data.products.length;
    }
  }
  return data;
}

export async function fetchProductById(id: number | string) {
  let product: DummyJsonProductRaw | undefined;
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      return undefined;
    }
    product = await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchProductById] Network error', err);
    }
    return undefined;
  }
  // Transform category string to object
  if (product && product.category) {
    product.category = transformCategoryStringToObject(product.category);
  }
  return product;
}

export async function searchProducts(query: string, sort?: string, skip = 0, limit = 20) {
  const params = new URLSearchParams({ q: query, skip: String(skip), limit: String(limit) });
  if (sort && sort !== 'relevance') params.append('sort', sort);
  let data: DummyJsonResponse;
  try {
    const response = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`);
    if (!response.ok) {
      return { products: [], total: 0, skip: 0, limit: 0 } as DummyJsonResponse;
    }
    data = await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.searchProducts] Network error', err);
    }
    return { products: [], total: 0, skip: 0, limit: 0 } as DummyJsonResponse;
  }
  // Transform category string to object for each product
  if (data.products && Array.isArray(data.products)) {
    // Type products from API before Zod parsing
    data.products = data.products.map((product: DummyJsonProductRaw) => ({
      ...product,
      category: transformCategoryStringToObject(product.category),
    }));
  }
  return data;
}

export async function fetchCategories(fetchOptions?: RequestInit) {
  let rawResponseJson: unknown;
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`, fetchOptions);
    if (!response.ok) {
      return [];
    }
    rawResponseJson = await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchCategories] Network error', err);
    }
    return [];
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Adapter.fetchCategories] Raw JSON response from API:', JSON.stringify(rawResponseJson));
  }

  if (!Array.isArray(rawResponseJson)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchCategories] Raw response is not an array as expected:', rawResponseJson);
    }
    return []; // Return empty or throw, critical error if API contract changes
  }

  // It's already typed as string[] by `await response.json()` if API sends string array.
  // Expect rawResponseJson to be Array<{ slug: string, name: string, url: string }>
  const categoryDataFromApi: Array<{ slug: string; name: string; url: string }> = rawResponseJson;

  const validatedCategories = categoryDataFromApi.filter(item =>
    item && typeof item.slug === 'string' && item.slug.trim() !== '' &&
    typeof item.name === 'string' && item.name.trim() !== ''
  );
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Adapter.fetchCategories] Validated category items from API (based on object structure):', JSON.stringify(validatedCategories));
  }

  if (validatedCategories.length !== categoryDataFromApi.length) {
    const rejectedItems = categoryDataFromApi.filter(item =>
      !(item && typeof item.slug === 'string' && item.slug.trim() !== '' &&
        typeof item.name === 'string' && item.name.trim() !== '')
    );
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Adapter.fetchCategories] Items rejected due to invalid structure/missing slug or name:', JSON.stringify(rejectedItems));
    }
  }

  const transformedCategories = validatedCategories.map((item, index) => {
    // item.name is already display-friendly from the API.
    // item.slug is the slug.
    return {
      id: index + 1, // Assign a simple numeric ID (1-based on the filtered/valid items)
      name: item.name,
      slug: item.slug
    };
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Adapter.fetchCategories] Transformed category objects for service layer:', JSON.stringify(transformedCategories));
  }
  return transformedCategories;
}

export async function fetchAllProductsSimple() {
  let data: DummyJsonResponse;
  try {
    const response = await fetch(`${API_BASE_URL}/products?limit=0`);
    if (!response.ok) {
      return { products: [], total: 0, skip: 0, limit: 0 } as DummyJsonResponse;
    }
    data = await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchAllProductsSimple] Network error', err);
    }
    return { products: [], total: 0, skip: 0, limit: 0 } as DummyJsonResponse;
  }
  // Transform category string to object for each product
  if (data.products && Array.isArray(data.products)) {
    // Type products from API before Zod parsing
    data.products = data.products.map((product: DummyJsonProductRaw) => ({
      ...product,
      category: transformCategoryStringToObject(product.category),
    }));
  }
  return data;
}

export async function login(credentials: { username?: string; password?: string }) {
  if (!credentials.username || !credentials.password) {
    throw new Error('Username and password are required.');
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // credentials: 'include', // Not typically needed for token-based auth like this
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        // expiresInMins: 30, // Removed as per instructions
      }),
    });

    if (!response.ok) {
      // Try to parse error message from DummyJSON, otherwise use statusText
      let errorData;
      try {
        errorData = await response.json();
      } catch { // 'e' removed as it's unused
        // Ignore if response is not JSON
      }
      const errorMessage = errorData?.message || response.statusText;
      console.error(`[Adapter.login] Login failed: ${response.status} ${errorMessage}`);
      throw new Error(`Login failed: ${errorMessage}`);
    }

    const jsonData = await response.json();
    // Parse with the direct API response schema (which expects accessToken and refreshToken)
    // and return it directly.
    return DummyJsonLoginApiSchema.parse(jsonData);

  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('[Adapter.login] Zod validation error:', err.errors);
      throw new Error('Login response validation failed.');
    }
    // Log other errors if not already logged by the conditional block above
    if (!(err instanceof Error && err.message.startsWith('Login failed:'))) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[Adapter.login] Network or other error', err);
        }
    }
    // Re-throw the original error if it's already specific, or a generic one
    throw err instanceof Error ? err : new Error('Login failed due to an unexpected error.');
  }
}

export async function fetchUser(userId: number | string) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchUser] Network error', err);
    }
    return null;
  }
}

export async function fetchUserCarts(userId: number | string) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/carts`);
    if (!response.ok) {
      return { carts: [] };
    }
    return await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchUserCarts] Network error', err);
    }
    return { carts: [] };
  }
}

export async function fetchCartById(cartId: number | string) {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/${cartId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchCartById] Network error', err);
    }
    return null;
  }
}

export async function fetchSearchHints(term: string, limit = 5): Promise<string[]> {
  try {
    const res = await fetch(`/api/search?term=${encodeURIComponent(term)}&limit=${limit}&onlyNames=true`);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.names ?? [];
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Adapter.fetchSearchHints] Network error', err);
    }
    return [];
  }
}

export async function createCheckoutSession(items: { productId: number; quantity: number }[]) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Checkout failed');
  }
  return response.json();
}
