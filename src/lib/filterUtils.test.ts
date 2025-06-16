// src/lib/filterUtils.test.ts
import { describe, it, expect } from 'vitest';
import { buildProductFilterQueryString, ProductFilterState } from './filterUtils';
// import { SortOption } from '@/bff/types'; // SortOption import removed as it's not directly used

describe('buildProductFilterQueryString', () => {
  it('should return an empty string if no filters are provided', () => {
    const filters: ProductFilterState = {};
    expect(buildProductFilterQueryString(filters)).toEqual('');
  });

  it('should return an empty string if filter values are undefined or empty arrays', () => {
    const filters: ProductFilterState = {
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
    };
    expect(buildProductFilterQueryString(filters)).toEqual('');
  });

  it('should build a query string for a single brand', () => {
    const filters: ProductFilterState = { brands: ['apple'] };
    expect(buildProductFilterQueryString(filters)).toEqual('brand=apple');
  });

  it('should build a query string for multiple brands', () => {
    const filters: ProductFilterState = { brands: ['apple', 'samsung'] };
    expect(buildProductFilterQueryString(filters)).toEqual('brand=apple&brand=samsung');
  });

  it('should build a query string for minPrice only', () => {
    const filters: ProductFilterState = { minPrice: 100 };
    expect(buildProductFilterQueryString(filters)).toEqual('minPrice=100');
  });

  it('should build a query string for maxPrice only', () => {
    const filters: ProductFilterState = { maxPrice: 500 };
    expect(buildProductFilterQueryString(filters)).toEqual('maxPrice=500');
  });

  it('should build a query string for both minPrice and maxPrice', () => {
    const filters: ProductFilterState = { minPrice: 100, maxPrice: 500 };
    expect(buildProductFilterQueryString(filters)).toEqual('minPrice=100&maxPrice=500');
  });

  it('should build a query string for brands and minPrice', () => {
    const filters: ProductFilterState = { brands: ['lg'], minPrice: 200 };
    expect(buildProductFilterQueryString(filters)).toEqual('brand=lg&minPrice=200');
  });

  it('should build a query string for brands, minPrice, and maxPrice', () => {
    const filters: ProductFilterState = {
      brands: ['sony', 'panasonic'],
      minPrice: 300,
      maxPrice: 1000,
    };
    expect(buildProductFilterQueryString(filters)).toEqual(
      'brand=sony&brand=panasonic&minPrice=300&maxPrice=1000'
    );
  });

  it('should ignore minPrice if it is NaN or null', () => {
    const filters1: ProductFilterState = { minPrice: NaN };
    expect(buildProductFilterQueryString(filters1)).toEqual('');
    const filters2: ProductFilterState = { minPrice: null }; // Removed 'as any'
    expect(buildProductFilterQueryString(filters2)).toEqual('');
  });

  it('should ignore maxPrice if it is NaN or null', () => {
    const filters1: ProductFilterState = { maxPrice: NaN };
    expect(buildProductFilterQueryString(filters1)).toEqual('');
    const filters2: ProductFilterState = { maxPrice: null }; // Removed 'as any'
    expect(buildProductFilterQueryString(filters2)).toEqual('');
  });

  it('should correctly remove a param if its value becomes undefined', () => {
    const filters: ProductFilterState = { minPrice: undefined, maxPrice: 200 };
    const initialQuery = 'minPrice=100&maxPrice=200';
    // The function now takes currentSearchQuery to allow removing params
    expect(buildProductFilterQueryString(filters, initialQuery)).toEqual('maxPrice=200');
  });

  it('should preserve other existing query parameters', () => {
    const filters: ProductFilterState = { brands: ['apple'] };
    const currentQuery = 'view=grid&page=2'; // Changed 'sort' to 'view'
    expect(buildProductFilterQueryString(filters, currentQuery)).toEqual(
      'view=grid&page=2&brand=apple'
    );
  });

  it('should override existing managed parameters but preserve others', () => {
    const filters: ProductFilterState = { brands: ['samsung'], minPrice: 50, sort: 'price_asc' };
    const currentQuery = 'brand=apple&page=1&minPrice=100&sort=newest&view=list';
    const result = buildProductFilterQueryString(filters, currentQuery);
    const params = new URLSearchParams(result);

    expect(params.get('page')).toEqual('1');
    expect(params.get('view')).toEqual('list');
    expect(params.getAll('brand')).toEqual(['samsung']);
    expect(params.get('minPrice')).toEqual('50');
    expect(params.get('sort')).toEqual('price_asc');
    expect(Array.from(params.keys()).length).toEqual(5); // page, view, brand, minPrice, sort
  });

  // Tests for sort functionality
  it('should add sort parameter if not relevance', () => {
    const filters: ProductFilterState = { sort: 'price_desc' };
    expect(buildProductFilterQueryString(filters)).toEqual('sort=price_desc');
  });

  it('should remove sort parameter if relevance', () => {
    const filters: ProductFilterState = { sort: 'relevance' };
    const currentQuery = 'sort=price_asc&page=1';
    expect(buildProductFilterQueryString(filters, currentQuery)).toEqual('page=1');
  });

  it('should remove sort parameter if undefined', () => {
    const filters: ProductFilterState = { sort: undefined };
    const currentQuery = 'sort=price_asc&page=1';
    expect(buildProductFilterQueryString(filters, currentQuery)).toEqual('page=1');
  });

  it('should handle sort with other filters', () => {
    const filters: ProductFilterState = { brands: ['apple'], sort: 'newest' };
    expect(buildProductFilterQueryString(filters)).toEqual('brand=apple&sort=newest');
  });

  it('should handle brand names with spaces and special characters (URL encoding)', () => {
    // URLSearchParams handles encoding automatically
    const filters: ProductFilterState = { brands: ['Great Brand', 'O\'Malley'] };
    const result = buildProductFilterQueryString(filters);
    // Expected: brand=Great+Brand&brand=O%27Malley (or similar encoding)
    // We can decode and check if it's too complex to match exact encoding
    const params = new URLSearchParams(result);
    const brands = params.getAll('brand');
    expect(brands).toEqual(['Great Brand', 'O\'Malley']);
  });

   it('should handle zero values for minPrice and maxPrice correctly', () => {
    const filters1: ProductFilterState = { minPrice: 0 };
    expect(buildProductFilterQueryString(filters1)).toEqual('minPrice=0');

    const filters2: ProductFilterState = { maxPrice: 0 };
    expect(buildProductFilterQueryString(filters2)).toEqual('maxPrice=0');

    const filters3: ProductFilterState = { minPrice: 0, maxPrice: 0 };
    expect(buildProductFilterQueryString(filters3)).toEqual('minPrice=0&maxPrice=0');
  });
});
