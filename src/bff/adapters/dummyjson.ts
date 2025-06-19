// src/bff/adapters/dummyjson.ts
import debug from 'debug';
const log = debug('storefront:bff:adapter:dummyjson');
// import { Buffer } from 'buffer'; // No longer needed as Content-Length is removed

import { httpClient } from '../httpClient'; // Import httpClient

// Helper to transform a category slug string into a Category-like object (name/slug)
const transformCategoryStringToObject = (categorySlug: string): { slug: string; name: string } => {
  if (typeof categorySlug !== 'string' || !categorySlug.trim()) {
    // This case should ideally not happen if DummyJSON product data is consistent
    log('WARN: Invalid category slug encountered: "%s". Using default.', categorySlug);
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
import { GetProductsOptions, zDummyJsonLoginSuccess, zDummyJsonRefreshResponse, AuthResponse } from '../types'; // Added AuthResponse

// Utility to handle non-OK responses from DummyJSON
function createErrorFromDummyJsonResponse(
    response: Response, // The original Response object
    responseData: any,  // The result of attempting response.json() (could be null if parsing failed)
    operationContext: string // e.g., "Login", "Token refresh"
): Error {
    const defaultErrorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
    const errorMessage = responseData?.message || defaultErrorMessage;
    console.error(`[dummyJsonAdapter] ${operationContext} failed. Error details:`, errorMessage); // Keep console.error for actual errors
    if (responseData && responseData !== null && typeof responseData !== 'string') { // Log full object if it's not just the message string
         log('[dummyJsonAdapter.handleError] Full error response object for %s: %O', operationContext, responseData);
    }
    return new Error(`${operationContext} failed: ${errorMessage}`);
}

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
  let endpoint = '/products';

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
    endpoint = `/products/category/${category}`;
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
    endpoint += `?${queryParams.toString()}`;
  }
  log('[Adapter.fetchProducts] Fetching endpoint: %s', endpoint);

  const response = await httpClient(endpoint, { method: 'GET' });
  if (!response.ok) {
    let errorData;
    try { errorData = await response.json(); } catch (e) { /* ignore */ }
    throw new Error(`Failed to fetch products from ${endpoint}: ${response.statusText}${errorData?.message ? ` - ${errorData.message}` : ''}`);
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
      log('[Adapter.fetchProducts] Before brand filter: %d products.', filteredProducts.length);
      filteredProducts = filteredProducts.filter((product: DummyJsonProductRaw) =>
        product.brand && brands.includes(product.brand)
      );
      log('[Adapter.fetchProducts] After brand filter: %d products.', filteredProducts.length);
    }

    // Client-side filtering for price range
    if (minPrice !== undefined) {
      log('[Adapter.fetchProducts] Before minPrice filter (%d): %d products.', minPrice, filteredProducts.length);
      filteredProducts = filteredProducts.filter((product: DummyJsonProductRaw) => product.price >= minPrice);
      log('[Adapter.fetchProducts] After minPrice filter: %d products.', filteredProducts.length);
    }
    if (maxPrice !== undefined) {
      log('[Adapter.fetchProducts] Before maxPrice filter (%d): %d products.', maxPrice, filteredProducts.length);
      filteredProducts = filteredProducts.filter((product: DummyJsonProductRaw) => product.price <= maxPrice);
      log('[Adapter.fetchProducts] After maxPrice filter: %d products.', filteredProducts.length);
    }

    // Apply sorting after filtering
    if (sort && sort !== 'relevance') {
      log('[Adapter.fetchProducts] Before sorting by "%s": %d products.', sort, filteredProducts.length);
      if (sort === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (sort === 'newest') {
        filteredProducts.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
      }
      log('[Adapter.fetchProducts] After sorting: %d products.', filteredProducts.length);
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
  const endpoint = `/products/${id}`;
  log('[Adapter.fetchProductById] Fetching endpoint: %s', endpoint);
  const response = await httpClient(endpoint, { method: 'GET' });
  if (!response.ok) {
    let errorData;
    try { errorData = await response.json(); } catch (e) { /* ignore */ }
    throw new Error(`Failed to fetch product by id ${id}: ${response.statusText}${errorData?.message ? ` - ${errorData.message}` : ''}`);
  }
  const product = await response.json();
  // Transform category string to object
  if (product && product.category) {
    product.category = transformCategoryStringToObject(product.category);
  }
  return product;
}

export async function searchProducts(query: string) {
  const endpoint = `/products/search?q=${encodeURIComponent(query)}`;
  log('[Adapter.searchProducts] Fetching endpoint: %s', endpoint);
  const response = await httpClient(endpoint, { method: 'GET' });
  if (!response.ok) {
    let errorData;
    try { errorData = await response.json(); } catch (e) { /* ignore */ }
    throw new Error(`Failed to search products with query "${query}": ${response.statusText}${errorData?.message ? ` - ${errorData.message}` : ''}`);
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
  const endpoint = '/products/categories';
  log('[Adapter.fetchCategories] Fetching endpoint: %s with options: %O', endpoint, fetchOptions);
  const response = await httpClient(endpoint, { method: 'GET', ...fetchOptions });
  if (!response.ok) {
    let errorData;
    let errorBodyText = response.statusText; // Fallback
    try {
      // Try to parse as JSON first for a structured message
      errorData = await response.json();
      if (errorData && errorData.message) {
        errorBodyText = errorData.message;
      }
    } catch (e) {
      // If not JSON, try to get text (though response might be consumed)
      try { errorBodyText = await response.text(); } catch (e2) { /* ignore */ }
    }
    throw new Error(`Failed to fetch categories: ${response.statusText} - ${errorBodyText}`);
  }

  const rawResponseJson = await response.json();
  log('[Adapter.fetchCategories] Raw JSON response from API: %O', rawResponseJson);


  if (!Array.isArray(rawResponseJson)) {
    // This is an actual error condition if the API contract is violated.
    console.error('[Adapter.fetchCategories] Raw response is not an array as expected:', rawResponseJson); // Keep console.error for actual errors
    return []; // Return empty or throw, critical error if API contract changes
  }

  // It's already typed as string[] by `await response.json()` if API sends string array.
  // Expect rawResponseJson to be Array<{ slug: string, name: string, url: string }>
  const categoryDataFromApi: Array<{ slug: string; name: string; url: string }> = rawResponseJson;

  const validatedCategories = categoryDataFromApi.filter(item =>
    item && typeof item.slug === 'string' && item.slug.trim() !== '' &&
    typeof item.name === 'string' && item.name.trim() !== ''
  );
  log('[Adapter.fetchCategories] Validated category items from API (based on object structure): %O', validatedCategories);


  if (validatedCategories.length !== categoryDataFromApi.length) {
    const rejectedItems = categoryDataFromApi.filter(item =>
      !(item && typeof item.slug === 'string' && item.slug.trim() !== '' &&
        typeof item.name === 'string' && item.name.trim() !== '')
    );
    log('WARN: [Adapter.fetchCategories] Items rejected due to invalid structure/missing slug or name: %O', rejectedItems);
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
  log('[Adapter.fetchCategories] Transformed category objects for service layer: %O', transformedCategories);
  return transformedCategories;
}

export async function fetchAllProductsSimple() {
  const endpoint = '/products?limit=0';
  log('[Adapter.fetchAllProductsSimple] Fetching endpoint: %s', endpoint);
  const response = await httpClient(endpoint, { method: 'GET' });
  if (!response.ok) {
    let errorData;
    try { errorData = await response.json(); } catch (e) { /* ignore */ }
    throw new Error(`Failed to fetch all products: ${response.statusText}${errorData?.message ? ` - ${errorData.message}` : ''}`);
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

export async function login({ username, password, expiresInMins }: { username?: string; password?: string; expiresInMins?: number }): Promise<AuthResponse> {
  const endpoint = '/auth/login'; // Changed to endpoint
  const httpMethod = 'POST';

  const requestBodyObject = { username, password, ...(expiresInMins !== undefined && { expiresInMins }) };
  const requestBodyString = JSON.stringify(requestBodyObject);

  // requestHeaders for Content-Type are now handled by httpClient defaults.

  if (process.env.NODE_ENV === 'development') {
      log('[dummyJsonAdapter.login] Payload type (stringified): %s', typeof requestBodyString);
      log('[dummyJsonAdapter.login] Payload slice (stringified, first 50 chars): %s', requestBodyString.slice(0, 50));
      const loggedCredentialsForDisplay = { username, password: password ? '********' : undefined, ...(expiresInMins !== undefined && { expiresInMins }) };
      log('[dummyJsonAdapter.login] Payload object being sent (masked password & expiresInMins): %O', loggedCredentialsForDisplay);
  }

  try {
    const response = await httpClient(endpoint, { // Changed to httpClient
      method: httpMethod,
      body: requestBodyString,
    });

    // Log status and headers first
    if (process.env.NODE_ENV === 'development') { // Replaced with log()
        log(`[dummyJsonAdapter.login] Response status: ${response.status} ${response.statusText}`);
        log('[dummyJsonAdapter.login] Response Headers:');
        response.headers.forEach((value, name) => {
          log('  %s: %s', name, value);
        });
    }

    let responseData = null;
    try {
        responseData = await response.json(); // Attempt to parse JSON directly
        if (process.env.NODE_ENV === 'development') { // Replaced with log()
            log(`[dummyJsonAdapter.login] Parsed response JSON data: %O`, responseData);
        }
    } catch (e) {
        log('WARN: [dummyJsonAdapter.login] Failed to parse response body as JSON directly: %s', e instanceof Error ? e.message : String(e));
        // If it failed, responseData is null. The !response.ok check or subsequent Zod parse will handle it.
    }

    if (!response.ok) {
      throw createErrorFromDummyJsonResponse(response, responseData, 'Login');
    }

    // If response.ok but responseData is null (JSON parsing failed for a 2xx response)
    if (responseData === null) {
        console.error('[dummyJsonAdapter.login] Failed to parse successful (2xx) response body as JSON.');
        throw new Error('Failed to parse successful login response from DummyJSON (2xx but not valid JSON).');
    }

    // Proceed with Zod parsing of responseData
    const parsedRaw = zDummyJsonLoginSuccess.parse(responseData);

    // console.log('[dummyJsonAdapter.login] Successfully parsed raw response with zDummyJsonLoginSuccess:', JSON.stringify(parsedRaw)); // Removed

    const normalizedResponse = {
      id:           String(parsedRaw.id), // Ensure ID is stringified
      username:     parsedRaw.username,
      email:        parsedRaw.email,
      firstName:    parsedRaw.firstName,
      lastName:     parsedRaw.lastName,
      gender:       parsedRaw.gender,
      image:        parsedRaw.image,
      token:        parsedRaw.accessToken,  // Key change: accessToken -> token
      refreshToken: parsedRaw.refreshToken, // Pass through refreshToken
      name:         `${parsedRaw.firstName} ${parsedRaw.lastName}`, // Combined name
      expiresInMins: expiresInMins !== undefined ? expiresInMins : 30, // Pass through or default
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

export async function refreshAccessToken(currentRefreshToken: string): Promise<{
  newAccessToken: string;
  newRefreshToken: string;
  newExpiresInMins: number; // Assuming DummyJSON provides a new expiry or we use a default
  id: number; // Keep id to ensure consistency for JWT
  username: string; // Keep username for JWT name field if needed
  email: string; // Keep email for JWT email field
  firstName: string; // For constructing name
  lastName: string; // For constructing name
  image: string; // For JWT picture
  gender: string; // If needed
  role?: string; // If roles are part of this response or can be re-derived
}> {
  const endpoint = '/auth/refresh'; // Changed to endpoint
  const httpMethod = 'POST';
  const defaultExpiresInMins = 30;

  const payloadObject = {
    refreshToken: currentRefreshToken,
    expiresInMins: defaultExpiresInMins // Request a new expiry
  };
  const payload = JSON.stringify(payloadObject);

  // requestHeaders for Content-Type are now handled by httpClient defaults.

  if (process.env.NODE_ENV === 'development') {
    log('[dummyJsonAdapter.refreshAccessToken] Attempting token refresh.');
    log('[dummyJsonAdapter.refreshAccessToken] Endpoint: %s', endpoint); // Changed targetUrl to endpoint
    log('[dummyJsonAdapter.refreshAccessToken] Payload for refresh: %O', payloadObject);
  }

  try {
    const response = await httpClient(endpoint, { // Changed to httpClient
      method: httpMethod,
      body: payload,
    });

    if (process.env.NODE_ENV === 'development') {
        log(`[dummyJsonAdapter.refreshAccessToken] Response status: ${response.status} ${response.statusText}`);
        log('[dummyJsonAdapter.refreshAccessToken] Response Headers:');
        response.headers.forEach((value, name) => {
          log('  %s: %s', name, value);
        });
    }

    let responseData = null;
    try {
        responseData = await response.json();
        if (process.env.NODE_ENV === 'development') { // Guard all dev logs
            log(`[dummyJsonAdapter.refreshAccessToken] Parsed response JSON data: %O`, responseData);
        }
    } catch (e) {
        log(`WARN: [dummyJsonAdapter.refreshAccessToken] Failed to parse response body as JSON directly: %s`, e instanceof Error ? e.message : String(e));
    }

    if (!response.ok) {
      throw createErrorFromDummyJsonResponse(response, responseData, 'Token refresh');
    }

    if (responseData === null) {
        console.error('[dummyJsonAdapter.refreshAccessToken] Failed to parse successful (2xx) response body as JSON.'); // Keep as console.error
        throw new Error('Failed to parse successful refresh response from DummyJSON (2xx but not valid JSON).');
    }

    const parsedRaw = zDummyJsonRefreshResponse.parse(responseData);
    if (process.env.NODE_ENV === 'development') { // Guard all dev logs
      log('[dummyJsonAdapter.refreshAccessToken] Successfully parsed refresh response.');
    }

    // Return the new tokens and relevant user data for JWT recreation
    return {
      newAccessToken: parsedRaw.accessToken,
      newRefreshToken: parsedRaw.refreshToken,
      newExpiresInMins: defaultExpiresInMins, // Or use a value from parsedRaw if API provides it (e.g. parsedRaw.expiresIn)
      id: parsedRaw.id,
      username: parsedRaw.username,
      email: parsedRaw.email,
      firstName: parsedRaw.firstName,
      lastName: parsedRaw.lastName,
      image: parsedRaw.image,
      gender: parsedRaw.gender,
      // Role might need to be re-fetched or assumed to be unchanged if not in refresh response
    };

  } catch (error) {
    console.error('[dummyJsonAdapter.refreshAccessToken] Error during token refresh operation:', error instanceof Error ? error.message : JSON.stringify(error));
    const finalErrorMessage = error instanceof Error ? error.message : 'Unknown error during token refresh.';
    throw new Error(`Token refresh failed: ${finalErrorMessage}`);
  }
}
