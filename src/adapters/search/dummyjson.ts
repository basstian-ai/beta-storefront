import { SearchAdapter } from './index';
import { fetchData } from '@/utils/fetchData';

const dummyJsonSearchAdapter: SearchAdapter = {
  search: (query: string, _sort?: string, _skip?: number, _limit?: number) =>
    fetchData(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`),
};

export default dummyJsonSearchAdapter;
