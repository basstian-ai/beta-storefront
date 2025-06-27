export * from './TypesenseSearch';
export * from './DummyJsonSearch';
export * from './SearchService';
export * from './types';
import { DummyJsonSearch } from './DummyJsonSearch';
export const searchSvc = new DummyJsonSearch();

