import type { SearchResponse, SearchResponseHit } from 'typesense';

export interface ProductDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
}

export type ProductSearchResponse = SearchResponse<ProductDocument>;
export type ProductSearchHit = SearchResponseHit<ProductDocument>;

export interface SearchApiResponse {
  hits: ProductSearchHit[] | undefined;
  totalHits: number;
  page: number;
  perPage: number;
  facetCounts?: Record<string, Record<string, number>>;
}
