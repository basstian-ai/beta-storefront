import { z } from 'zod';
import {
  GetProductsOptions,
  PaginatedProductsSchema,
  ProductSchema,
  ServiceProductsResponseSchema,
} from '@/bff/types';
import { fetchProducts, fetchProductById } from './dummyjson';

export interface ProductService {
  listProducts(
    options?: GetProductsOptions,
  ): Promise<z.infer<typeof ServiceProductsResponseSchema>>;
  getProduct(id: number): Promise<z.infer<typeof ProductSchema>>;
}

export const DEFAULT_LIMIT = 20;

export class DummyJsonProductService implements ProductService {
  async listProducts(
    options: GetProductsOptions = {},
  ): Promise<z.infer<typeof ServiceProductsResponseSchema>> {
    const data = await fetchProducts(options);
    const parsed = PaginatedProductsSchema.parse(data);
    return ServiceProductsResponseSchema.parse({
      items: parsed.products,
      total: parsed.total,
      skip: parsed.skip,
      limit: parsed.limit,
    });
  }

  async getProduct(id: number): Promise<z.infer<typeof ProductSchema>> {
    const data = await fetchProductById(id);
    return ProductSchema.parse(data);
  }
}

export const productService: ProductService = new DummyJsonProductService();

