export interface SearchAdapter {
  search(query: string, sort?: string, skip?: number, limit?: number): Promise<unknown>;
  fetchHints(term: string, limit?: number): Promise<string[]>;
}

import dummyJsonSearchAdapter from './dummyjson';

export const searchAdapter: SearchAdapter = dummyJsonSearchAdapter;
export default searchAdapter;
