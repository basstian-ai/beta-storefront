import { z } from 'zod';
import {
  GetProductsOptions,
  PaginatedProductsSchema,
  ProductSchema,
  ServiceProductsResponseSchema,
} from '@/bff/types';
import { fetchProducts, fetchProductById } from '../dummyjson';
import { ProductService, ProductServiceError } from '../productService';

export class DummyJsonProductService implements ProductService {
  readonly supports = { price: true, stock: true, facets: false } as const;

  async listProducts(
    options: GetProductsOptions = {},
  ): Promise<z.infer<typeof ServiceProductsResponseSchema>> {
    try {
      const data = await fetchProducts(options);
      const parsed = PaginatedProductsSchema.parse(data);
      return ServiceProductsResponseSchema.parse({
        items: parsed.products,
        total: parsed.total,
        skip: parsed.skip,
        limit: parsed.limit,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ProductServiceError('Invalid product data from source', 502);
      }
      throw err;
    }
  }

  async getProduct(id: string): Promise<z.infer<typeof ProductSchema>> {
    const data = await fetchProductById(id);
    if (!data) {
      throw new ProductServiceError('Product not found', 404);
    }
    try {
      return ProductSchema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ProductServiceError('Invalid product data from source', 502);
      }
      throw err;
    }
  }
}
