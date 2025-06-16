// src/bff/adapters/dummyjson.ts

const API_BASE_URL = 'https://dummyjson.com';

export async function fetchProducts(options: { category?: string; limit?: number; skip?: number; sort?: string } = {}) {
  const { category, limit, skip, sort } = options;
  let url = `${API_BASE_URL}/products`;

  if (category) {
    url = `${API_BASE_URL}/products/category/${category}`;
  }

  const queryParams = new URLSearchParams();
  if (limit !== undefined) queryParams.append('limit', String(limit));
  if (skip !== undefined) queryParams.append('skip', String(skip));
  // Note: dummyjson doesn't explicitly support sorting on all fields or multiple sort fields.
  // We'll assume a simple 'sortBy' and 'order' if the API supports it, or handle it client-side/in service layer if not.
  // For now, let's assume dummyjson might support a 'sort' query param directly if we pass it.
  if (sort) queryParams.append('sort', sort);


  if (queryParams.toString()) {
    // Check if the URL already has query parameters (e.g. in category case)
    url += (url.includes('?') ? '&' : '?') + queryParams.toString();
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchProductById(id: number | string) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product by id ${id}: ${response.statusText}`);
  }
  return response.json();
}

export async function searchProducts(query: string) {
  const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Failed to search products with query "${query}": ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCategories(fetchOptions?: RequestInit) { // Added fetchOptions
  const response = await fetch(`${API_BASE_URL}/products/categories`, fetchOptions); // Pass options
  if (!response.ok) {
    // Log more details from response if possible
    const errorBody = await response.text();
    console.error(`Failed to fetch categories. Status: ${response.status}. Body: ${errorBody}`);
    throw new Error(`Failed to fetch categories: ${response.statusText} - ${errorBody}`);
  }
  const categorySlugs: string[] = await response.json();

  // Transform to the new Category object structure
  return categorySlugs
    .filter(slug => typeof slug === 'string' && slug.trim() !== '') // Ensure slug is a non-empty string
    .map((slug, index) => {
      // slug is now guaranteed to be a string
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        id: index + 1, // Assign a simple numeric ID (1-based on the filtered/valid items)
        name: name,
        slug: slug
      };
    });
}

export async function fetchAllProductsSimple() {
  // DummyJSON limit is 100 by default if not specified, and total is 100.
  // If it were more, we'd need to handle pagination to get all products.
  const response = await fetch(`${API_BASE_URL}/products?limit=0`); // limit=0 often means all items
  if (!response.ok) {
    throw new Error(`Failed to fetch all products: ${response.statusText}`);
  }
  return response.json(); // This should return { products: [], total, skip, limit }
}

export async function login(credentials: { username?: string; password?: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    // It's common for login errors to return specific messages in the body
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Login failed: ${errorBody.message || response.statusText}`);
  }
  return response.json();
}
