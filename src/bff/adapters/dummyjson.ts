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

export async function fetchProducts(options: { category?: string; limit?: number; skip?: number; sort?: string } = {}) {
  const { category, limit, skip, sort } = options;
  let url = `${API_BASE_URL}/products`;

  if (category) {
    url = `${API_BASE_URL}/products/category/${category}`;
  }

  const queryParams = new URLSearchParams();
  if (limit !== undefined) queryParams.append('limit', String(limit));
  if (skip !== undefined) queryParams.append('skip', String(skip));
  if (sort) queryParams.append('sort', sort);


  if (queryParams.toString()) {
    url += (url.includes('?') ? '&' : '?') + queryParams.toString();
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
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
  const categorySlugs: string[] = await response.json();

  return categorySlugs
    .filter(slug => typeof slug === 'string' && slug.trim() !== '')
    .map((slug, index) => {
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        id: index + 1,
        name: name,
        slug: slug
      };
    });
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
