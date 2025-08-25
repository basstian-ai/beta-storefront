import { GetProductsOptions } from '@/bff/types';

export interface CommerceAdapter {
  fetchAllProductsSimple(): Promise<unknown>;
  fetchProducts(options: GetProductsOptions): Promise<unknown>;
  fetchProductById(id: number | string): Promise<unknown>;
  fetchCategories(fetchOptions?: RequestInit): Promise<unknown>;
  fetchOrders(): Promise<unknown>;
}
