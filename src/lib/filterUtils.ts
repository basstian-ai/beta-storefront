// src/lib/filterUtils.ts
import { SortOption } from '@/bff/types'; // Import SortOption

export interface ProductFilterState {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption; // Added sort option
}

export function buildProductFilterQueryString(
  filters: ProductFilterState,
  currentSearchQuery: string = '' // Existing search query string to preserve other params
): string {
  const params = new URLSearchParams(currentSearchQuery);

  // Handle brands
  params.delete('brand'); // Clear existing brand params before adding new ones
  if (filters.brands && filters.brands.length > 0) {
    filters.brands.forEach(brand => params.append('brand', brand));
  }

  // Handle minPrice
  if (filters.minPrice !== undefined && filters.minPrice !== null && !isNaN(filters.minPrice)) {
    params.set('minPrice', String(filters.minPrice));
  } else {
    params.delete('minPrice');
  }

  // Handle maxPrice
  if (filters.maxPrice !== undefined && filters.maxPrice !== null && !isNaN(filters.maxPrice)) {
    params.set('maxPrice', String(filters.maxPrice));
  } else {
    params.delete('maxPrice');
  }

  // Handle sort
  if (filters.sort && filters.sort !== 'relevance') {
    params.set('sort', filters.sort);
  } else {
    params.delete('sort'); // Remove sort if 'relevance' or undefined
  }

  return params.toString();
}
