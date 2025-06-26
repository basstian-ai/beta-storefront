import type { Product } from "../../types";
export interface SearchOpts {
  filters?: string;
  page?: number;
  perPage?: number;
}

export interface SearchService {
  search(q: string, opts?: SearchOpts): Promise<any>;
  indexProducts(p: Product[]): Promise<void>;
}
