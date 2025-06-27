import useSWR from 'swr';
import type { SearchApiResponse } from '@/lib/search';

export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  priceMax?: number;
  page?: number;
  perPage?: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useProductSearch(params: SearchParams) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.category) qs.set('category', params.category);
  if (params.brand) qs.set('brand', params.brand);
  if (params.priceMax !== undefined) qs.set('priceMax', String(params.priceMax));
  if (params.page) qs.set('page', String(params.page));
  if (params.perPage) qs.set('perPage', String(params.perPage));
  const query = qs.toString();
  const { data, error, isLoading } = useSWR<SearchApiResponse>(`/api/search?${query}`, fetcher);
  return {
    hits: data?.hits ?? [],
    found: data?.totalHits ?? 0,
    facetCounts: data?.facetCounts ?? {},
    isLoading,
    error,
  };
}
