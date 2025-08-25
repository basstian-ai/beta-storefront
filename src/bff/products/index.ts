import { commerceAdapter } from '@/adapters/commerce';
import appInsights from 'applicationinsights';
import { z } from 'zod';
import { PaginatedProductsSchema, ProductSchema } from '../types';

export type PaginatedProducts = z.infer<typeof PaginatedProductsSchema>;
export type Product = z.infer<typeof ProductSchema>;

/**
 * Fetches product data from dummyjson.com.
 * @returns A promise that resolves to the product data.
 */
export async function getProducts(): Promise<PaginatedProducts> {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for products',
      severity: 1, // Info
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    const data = await commerceAdapter.fetchProducts({});
    const parsed = PaginatedProductsSchema.parse(data);

    client.trackEvent({
      name: 'ProductsFetchSuccess',
      properties: {
        source: 'dummyjson',
        userType: 'anonymous', // Assuming anonymous for now
        resultCount: parsed.products.length,
      },
    });

    if (parsed.products.length) {
      client.trackMetric({
        name: 'ProductsReturned',
        value: parsed.products.length,
      });
    }

    return parsed;
  } catch (error) {
    client.trackException({
      exception: error as Error,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}

/**
 * Fetches a single product by id from dummyjson.com.
 * @param id - The product id.
 * @returns The product data.
 */
export async function getProduct(id: string | number): Promise<Product> {
  try {
    const data = await commerceAdapter.fetchProductById(id);
    return ProductSchema.parse(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
