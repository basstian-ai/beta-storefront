// src/bff/adapters/dummyjson.ts

const API_BASE_URL = 'https://dummyjson.com';

// Helper to transform a category slug string into a Category-like object (name/slug)
const transformCategoryStringToObject = (categorySlug: string): { slug: string; name: string } => {
  if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
    // This case should ideally not happen if DummyJSON product data is consistent
    console.warn(`Invalid category slug encountered: "${categorySlug}". Using default.`);
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

// Import GetProductsOptions type
import { GetProductsOptions } from '../types';

export async function fetchProducts(options: GetProductsOptions = {}) {
  const { category, limit, skip, sort, brands, minPrice, maxPrice } = options; // Added minPrice, maxPrice
  let url = `${API_BASE_URL}/products`;

  // Determine if we need to fetch all products for client-side filtering/pagination
  let fetchAllForManualFiltering = false;
  if ((brands && brands.length > 0) || minPrice !== undefined || maxPrice !== undefined) {
    fetchAllForManualFiltering = true;
  }

  let fetchLimit = limit;
  let fetchSkip = skip;

  if (category) {
    url = `${API_BASE_URL}/products/category/${category}`;
    if (fetchAllForManualFiltering) {
      fetchLimit = 0; // Fetch all for this category for manual filtering
      fetchSkip = undefined;
    }
  } else if (fetchAllForManualFiltering) {
    // No category, but brands or price filters specified. Fetch all products.
    fetchLimit = 0; // Fetch all products
    fetchSkip = undefined;
  }


  const queryParams = new URLSearchParams();
  if (fetchLimit !== undefined) queryParams.append('limit', String(fetchLimit));
  if (fetchSkip !== undefined) queryParams.append('skip', String(fetchSkip));
  if (sort) queryParams.append('sort', sort);


  if (queryParams.toString()) {
    url += (url.includes('?') ? '&' : '?') + queryParams.toString();
  }
  console.log(`[Adapter.fetchProducts] Fetching URL: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch products from ${url}: ${response.statusText}`);
  }
  const data = await response.json();

  // Transform category string to object for each product
  if (data.products && Array.isArray(data.products)) {
    data.products = data.products.map((product: any) => ({
      ...product,
      category: transformCategoryStringToObject(product.category),
    }));

    let filteredProducts = data.products;

    // Client-side filtering for brands if brands are specified
    if (brands && brands.length > 0) {
      console.log(`[Adapter.fetchProducts] Before brand filter: ${filteredProducts.length} products.`);
      filteredProducts = filteredProducts.filter((product: any) =>
        product.brand && brands.includes(product.brand)
      );
      console.log(`[Adapter.fetchProducts] After brand filter: ${filteredProducts.length} products.`);
    }

    // Client-side filtering for price range
    if (minPrice !== undefined) {
      console.log(`[Adapter.fetchProducts] Before minPrice filter (${minPrice}): ${filteredProducts.length} products.`);
      filteredProducts = filteredProducts.filter((product: any) => product.price >= minPrice);
      console.log(`[Adapter.fetchProducts] After minPrice filter: ${filteredProducts.length} products.`);
    }
    if (maxPrice !== undefined) {
      console.log(`[Adapter.fetchProducts] Before maxPrice filter (${maxPrice}): ${filteredProducts.length} products.`);
      filteredProducts = filteredProducts.filter((product: any) => product.price <= maxPrice);
      console.log(`[Adapter.fetchProducts] After maxPrice filter: ${filteredProducts.length} products.`);
    }

    data.products = filteredProducts;
    // Update total to reflect filtered count. This is a client-side adjustment.
    data.total = filteredProducts.length;

    // Apply manual pagination if we fetched all due to any filtering
    if (fetchAllForManualFiltering && limit !== undefined && limit > 0) {
       const actualSkip = skip || 0;
       data.products = filteredProducts.slice(actualSkip, actualSkip + limit);
       data.skip = actualSkip; // Reflect the manual skip
       data.limit = limit; // Reflect the manual limit (actual number of items returned)
    } else if (!fetchAllForManualFiltering) {
      // If API did pagination, ensure skip/limit from API response are respected if they exist
      // DummyJSON response includes 'skip' and 'limit' that it applied.
      // No specific action needed here as data.skip and data.limit would already be from API response.
    }
  }
  return data;
}

export async function fetchProductById(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product by id ${id}: ${response.statusText}`);
  }
  const product = await response.json();
  // Transform category string to object
  if (product && product.category) {
    product.category = transformCategoryStringToObject(product.category);
  }
  return product;
}

export async function searchProducts(query: string) {
  const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Failed to search products with query "${query}": ${response.statusText}`);
  }
  const data = await response.json();
  // Transform category string to object for each product
  if (data.products && Array.isArray(data.products)) {
    data.products = data.products.map((product: any) => ({
      ...product,
      category: transformCategoryStringToObject(product.category),
    }));
  }
  return data;
}

export async function fetchCategories(fetchOptions?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}/products/categories`, fetchOptions);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Failed to fetch categories. Status: ${response.status}. Body: ${errorBody}`);
    throw new Error(`Failed to fetch categories: ${response.statusText} - ${errorBody}`);
  }

  const rawResponseJson = await response.json();
  console.log('[Adapter.fetchCategories] Raw JSON response from API:', JSON.stringify(rawResponseJson));

  if (!Array.isArray(rawResponseJson)) {
    console.error('[Adapter.fetchCategories] Raw response is not an array as expected:', rawResponseJson);
    return []; // Return empty or throw, critical error if API contract changes
  }

  // It's already typed as string[] by `await response.json()` if API sends string array.
  // Expect rawResponseJson to be Array<{ slug: string, name: string, url: string }>
  const categoryDataFromApi: Array<{ slug: string; name: string; url: string }> = rawResponseJson;

  const validatedCategories = categoryDataFromApi.filter(item =>
    item && typeof item.slug === 'string' && item.slug.trim() !== '' &&
    typeof item.name === 'string' && item.name.trim() !== ''
  );
  console.log('[Adapter.fetchCategories] Validated category items from API (based on object structure):', JSON.stringify(validatedCategories));

  if (validatedCategories.length !== categoryDataFromApi.length) {
    const rejectedItems = categoryDataFromApi.filter(item =>
      !(item && typeof item.slug === 'string' && item.slug.trim() !== '' &&
        typeof item.name === 'string' && item.name.trim() !== '')
    );
    console.warn('[Adapter.fetchCategories] Items rejected due to invalid structure/missing slug or name:', JSON.stringify(rejectedItems));
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
  console.log('[Adapter.fetchCategories] Transformed category objects for service layer:', JSON.stringify(transformedCategories));
  return transformedCategories;
}

export async function fetchAllProductsSimple() {
  const response = await fetch(`${API_BASE_URL}/products?limit=0`);
  if (!response.ok) {
    throw new Error(`Failed to fetch all products: ${response.statusText}`);
  }
  const data = await response.json();
  // Transform category string to object for each product
  if (data.products && Array.isArray(data.products)) {
    data.products = data.products.map((product: any) => ({
      ...product,
      category: transformCategoryStringToObject(product.category),
    }));
  }
  return data;
}

export async function login(credentials: { username?: string; password?: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Login failed: ${errorBody.message || response.statusText}`);
  }
  return response.json();
}
