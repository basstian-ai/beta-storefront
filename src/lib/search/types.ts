// Simplified search result structures so we can mock Typesense


export interface ProductDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
}

export interface ProductSearchHit {
  document: ProductDocument;
}

export interface FacetCount {
  field_name: string;
  counts: { value: string; count: number }[];
}

export interface ProductSearchResponse {
  hits: ProductSearchHit[];
  found: number;
  facet_counts?: FacetCount[];
  page?: number;
  per_page?: number;
}

export interface SearchApiResponse {
  hits: ProductSearchHit[] | undefined;
  totalHits: number;
  page: number;
  perPage: number;
  facetCounts?: Record<string, Record<string, number>>;
}
