// src/bff/adapters/dummyjson.ts
// import { Buffer } from 'buffer'; // No longer needed as Content-Length is removed

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

// Import GetProductsOptions type
import { GetProductsOptions, zDummyJsonLoginSuccess } from '../types'; // Added zDummyJsonLoginSuccess

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

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch products from ${url}: ${response.statusText}`);
  }
  const data: DummyJsonResponse = await response.json();

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
  const data: DummyJsonResponse = await response.json();
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
  const response = await fetch(`${API_BASE_URL}/products/categories`, fetchOptions);
  if (!response.ok) {
    const errorBody = await response.text();
    // This error is critical for operation, so it might be useful in prod if not handled elsewhere.
    // However, following the general instruction to gate most logs for this task.
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Failed to fetch categories. Status: ${response.status}. Body: ${errorBody}`);
    }
    throw new Error(`Failed to fetch categories: ${response.statusText} - ${errorBody}`);
  }

  const rawResponseJson = await response.json();
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
  const response = await fetch(`${API_BASE_URL}/products?limit=0`);
  if (!response.ok) {
    throw new Error(`Failed to fetch all products: ${response.statusText}`);
  }
  const data: DummyJsonResponse = await response.json();
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

export async function login(_credentials?: { username?: string; password?: string }) {
  // Use environment variables for credentials, with fallback to new defaults
  const username = process.env.DUMMYJSON_USER || 'emilys';
  const password = process.env.DUMMYJSON_PASS || 'emilyspass';

  // Log which credentials are being used (source)
  if (process.env.DUMMYJSON_USER || process.env.DUMMYJSON_PASS) {
     console.log('[dummyJsonAdapter.login] Using credentials from environment variables.');
  } else {
     console.log('[dummyJsonAdapter.login] Using fallback credentials (emilys/emilyspass).');
  }

  const targetUrl = `${API_BASE_URL}/auth/login`;
  const method = 'POST';

  const payloadObject = {
    username,
    password,
    expiresInMins: 30
  };
  const payload = JSON.stringify(payloadObject);

  const requestHeaders = {
    'Content-Type': 'application/json',
  };

  const loggedCredentialsForDisplay = { username, password: password ? '********' : undefined, expiresInMins: 30 }; // This can be removed if not used below

  // console.log('[dummyJsonAdapter.login] Attempting login (simplified headers, with expiresInMins).'); // Removed
  // console.log('[dummyJsonAdapter.login] Target URL:', targetUrl); // Removed
  // console.log('[dummyJsonAdapter.login] Method:', method); // Removed
  // console.log('[dummyJsonAdapter.login] Headers to be sent (minimal):', JSON.stringify(requestHeaders)); // Removed
  // console.log('[dummyJsonAdapter.login] Payload type:', typeof payload); // Removed
  // console.log('[dummyJsonAdapter.login] Payload slice (first 50 chars):', payload.slice(0, 50)); // Removed
  // console.log('[dummyJsonAdapter.login] Payload object (credentials with masked password & expiresInMins):', JSON.stringify(loggedCredentialsForDisplay)); // Removed


  try {
    const response = await fetch(targetUrl, {
      method: method,
      headers: requestHeaders, // Simplified headers
      body: payload,
    });

    // console.log(`[dummyJsonAdapter.login] Response status: ${response.status}`); // Removed
    // console.log(`[dummyJsonAdapter.login] Response status text: ${response.statusText}`); // Removed

    // console.log('[dummyJsonAdapter.login] Response Headers:'); // Removed
    // response.headers.forEach((value, name) => { // Removed
    //   console.log(`  ${name}: ${value}`); // Removed
    // }); // Removed

    const responseBodyText = await response.text();
    // console.log(`[dummyJsonAdapter.login] Raw response body text: ${responseBodyText}`); // Removed

    if (!response.ok) {
      let errorBodyJson = { message: `Request failed with status ${response.status}: ${responseBodyText}` }; // Include raw text in default
      try {
        errorBodyJson = JSON.parse(responseBodyText);
      } catch (e) {
        console.warn('[dummyJsonAdapter.login] Failed to parse error response body as JSON (raw text used in error):', e);
      }
      const errorMessage = errorBodyJson.message || response.statusText || `Request failed with status ${response.status}`;
      console.error('[dummyJsonAdapter.login] Login failed. Error details:', errorMessage);
      throw new Error(`Login failed: ${errorMessage}`);
    }

    // Parse the successful response text as JSON
    let responseJson;
    try {
         responseJson = JSON.parse(responseBodyText);
    } catch (e) {
         console.error('[dummyJsonAdapter.login] Failed to parse successful response body as JSON:', e);
         console.error('[dummyJsonAdapter.login] Raw body that failed parsing:', responseBodyText);
         throw new Error('Failed to parse successful login response from DummyJSON.');
    }
    // console.log('[dummyJsonAdapter.login] Successfully parsed response JSON:', JSON.stringify(responseJson)); // Old log

    const parsedRaw = zDummyJsonLoginSuccess.parse(responseJson); // responseJson is the already JSON.parsed body

    // console.log('[dummyJsonAdapter.login] Successfully parsed raw response with zDummyJsonLoginSuccess:', JSON.stringify(parsedRaw)); // Removed

    const normalizedResponse = {
      id:           parsedRaw.id,
      username:     parsedRaw.username,
      email:        parsedRaw.email,
      firstName:    parsedRaw.firstName,
      lastName:     parsedRaw.lastName,
      gender:       parsedRaw.gender,
      image:        parsedRaw.image,
      token:        parsedRaw.accessToken,  // Key change: accessToken -> token
      refreshToken: parsedRaw.refreshToken, // Pass through refreshToken
      name:         `${parsedRaw.firstName} ${parsedRaw.lastName}`, // Combined name
    };

    // console.log('[dummyJsonAdapter.login] Returning normalized response:', JSON.stringify(normalizedResponse)); // Removed
    return normalizedResponse;

  } catch (error) {
    console.error('[dummyJsonAdapter.login] Error during fetch operation or response processing:', error instanceof Error ? error.message : JSON.stringify(error));
    // If it's an error from `throw new Error(...)` above, it will be re-thrown.
    // If it's a network error or other fetch-related error, it will be thrown here.
    // Ensure the error message is useful or re-wrap if necessary.
    if (error instanceof Error && error.message.startsWith('Login failed:')) {
         throw error;
    }
    // Ensure the specific parsing error is also re-thrown if it occurs
    if (error instanceof Error && error.message.startsWith('Failed to parse successful login response from DummyJSON.')) {
        throw error;
    }
    // Ensure a comprehensive error message for other types of errors
    const finalErrorMessage = error instanceof Error ? error.message : 'Unknown error during login attempt.';
    throw new Error(`Network or unexpected error during login: ${finalErrorMessage}`);
  }
}
