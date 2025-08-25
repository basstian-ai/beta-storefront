import { SearchAdapter } from './index';
import { fetchSearchHints } from '@/lib/services/dummyjson';
import { fetchData } from '@/utils/fetchData';

const dummyJsonSearchAdapter: SearchAdapter = {
  search: async (query: string, sort?: string, skip?: number, limit?: number) => {
    const url = new URL('https://dummyjson.com/products/search');
    url.searchParams.set('q', query);
    if (sort) url.searchParams.set('sort', sort);
    if (typeof skip === 'number') url.searchParams.set('skip', String(skip));
    if (typeof limit === 'number') url.searchParams.set('limit', String(limit));
    const { data, error } = await fetchData<unknown>(url.toString());
    if (error || !data) {
      throw error;
    }
    return data;
  },
  fetchHints: fetchSearchHints,
};

export default dummyJsonSearchAdapter;
