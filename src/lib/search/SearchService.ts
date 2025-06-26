import type { Product } from "../../../types";
import type { ProductSearchResponse } from './types';
export interface SearchOpts {
  filters?: string;
  page?: number;
  perPage?: number;
}

export interface SearchService {
  search(q: string, opts?: SearchOpts): Promise<ProductSearchResponse>;
  indexProducts(p: Product[]): Promise<void>;
}

