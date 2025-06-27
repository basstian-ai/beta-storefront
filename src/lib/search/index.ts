export * from './SearchService';
export * from './types';

import { MockSearch } from './MockSearch';

let svc: import('./SearchService').SearchService;
const driver = process.env.SEARCH_DRIVER ?? 'mock';

if (driver === 'typesense') {
  try {
    // @ts-expect-error Optional dependency
    const dynamicImport = new Function('p', 'return import(p)');
    const mod = await dynamicImport('./TypesenseSearch');
    svc = new mod.TypesenseSearch();
  } catch (err) {
    console.error('TypesenseSearch unavailable, falling back to mock', err);
    svc = new MockSearch();
  }
} else {
  svc = new MockSearch();
}

export const searchSvc = svc;
