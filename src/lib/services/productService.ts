import { z } from 'zod';
import { GetProductsOptions, ProductSchema, ServiceProductsResponseSchema } from '@/bff/types';

export interface ProductService {
  listProducts(options?: GetProductsOptions): Promise<z.infer<typeof ServiceProductsResponseSchema>>;
  getProduct(id: string): Promise<z.infer<typeof ProductSchema>>;
  readonly supports: { price: boolean; stock: boolean; facets: boolean };
}

export const DEFAULT_LIMIT = 20;

export type ServiceKind = 'dummyjson';

export class ProductServiceError extends Error {
  constructor(message: string, public readonly status = 500) {
    super(message);
    this.name = 'ProductServiceError';
  }
}
