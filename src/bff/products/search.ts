import { searchAdapter } from '@/adapters/search';
import appInsights from 'applicationinsights';
import { z } from 'zod';
import { PaginatedProductsSchema, ProductSchema } from '../types';

export type Product = z.infer<typeof ProductSchema>;

/**
 * Searches for products via dummyjson.com.
 * @param query - Keyword to search for.
 * @returns Array of product objects from dummyjson.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for product search',
      severity: 1,
      properties: { origin: 'bff/products', method: 'searchProducts' },
    });

    const data = await searchAdapter.search(query);
    const parsed = PaginatedProductsSchema.parse(data);

    client.trackEvent({
      name: 'ProductSearchSuccess',
      properties: { query, resultCount: parsed.products.length },
    });

    if (parsed.products.length) {
      client.trackMetric({
        name: 'ProductsFound',
        value: parsed.products.length,
      });
    }

    return parsed.products;
  } catch (error) {
    client.trackException({
      exception: error as Error,
      properties: { origin: 'bff/products', method: 'searchProducts' },
    });
    throw error;
  }
}
