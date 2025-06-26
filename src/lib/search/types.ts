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
  total_hits: number;
}
