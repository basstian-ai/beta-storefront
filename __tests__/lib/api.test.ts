import {
  fetchCategories, // Keep this if fetchCategories tests are to remain
  fetchCategoryWithProducts,
  CategoryPageData,
  Product,
  Category as ApiCategory,  // Renaming to avoid conflict with Category from ../types if used by fetchCategories
  Facets
} from '@/lib/api'; // Using @ alias assuming it's configured for __tests__
// import { Category as ImportedCategoryType } from '../../types'; // This seems unused if ApiCategory handles the alias for fetchCategories tests or if fetchCategories is updated.
// For now, assuming fetchCategories tests will align with types from @/lib/api or its direct ../types import.
// If fetchCategories strictly returns the type from ../../types, then ImportedCategoryType is needed.
// Based on lib/api.ts, fetchCategories returns ImportedCategory[] which IS from ../types. So, this import is needed.
import { Category as ImportedCategoryType } from '../../types';
import { ActiveFilters } from '@/components/FacetFilters';
import importedMockData from '../../../bff/data/mock-category-data.json';
const MOCK_CATEGORIES_DATA_JSON = importedMockData as CategoryPageData[];

// Mock fetch for fetchCategories
global.fetch = jest.fn();

// Existing tests for fetchCategories (assuming they are to be kept)
describe('fetchCategories', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should fetch and transform categories correctly', async () => {
    const mockData = ['electronics', 'jewelery', "men's clothing"];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    const categories = await fetchCategories();
    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products/categories');
    expect(categories).toEqual([
      { id: 'electronics', name: 'electronics', slug: 'electronics' },
      { id: 'jewelery', name: 'jewelery', slug: 'jewelery' },
      { id: "men's clothing", name: "men's clothing", slug: "men's-clothing" },
    ]);
  });

  it('should return an empty array if fetch fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Server Error'});
    await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories');
  });

  it('should return an empty array if fetched data is not an array', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Not an array' }) });
    const categories = await fetchCategories();
    expect(categories).toEqual([]);
  });

  it('should handle categories with existing name and slug properties', async () => {
    const mockData = [{ name: 'Home Goods', slug: 'home-goods' }, 'books'];
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockData });
    const categories = await fetchCategories();
    expect(categories).toEqual([
      { id: 'home-goods', name: 'Home Goods', slug: 'home-goods' },
      { id: 'books', name: 'books', slug: 'books' },
    ]);
  });

  it('should filter out null or unexpectedly formatted categories', async () => {
    const mockData = ['valid-category', null, { random: 'object' }, undefined, 123];
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockData });
    const categories = await fetchCategories();
    expect(categories).toEqual([{ id: 'valid-category', name: 'valid-category', slug: 'valid-category' }]);
  });
});


const electronicsCategorySlug = 'electronics';
const electronicsMockSource = MOCK_CATEGORIES_DATA_JSON.find(d => d.category.slug === electronicsCategorySlug)!;

const apparelCategorySlug = 'apparel';
const apparelMockSource = MOCK_CATEGORIES_DATA_JSON.find(d => d.category.slug === apparelCategorySlug)!;

describe('fetchCategoryWithProducts - BFF Filtering Logic (Updated Tests)', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should return all products for a category if filters argument is undefined', async () => {
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, undefined);
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(electronicsMockSource.products.length);
    expect(result?.products).toEqual(electronicsMockSource.products.map(p => expect.objectContaining(p)));
    expect(result?.category.slug).toBe(electronicsCategorySlug);
    expect(result?.facets).toEqual(electronicsMockSource.facets);
  });

  it('should return all products if activeFilters is an empty object', async () => {
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, {});
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(electronicsMockSource.products.length);
  });

  it('should return filtered products when a single brand filter is provided', async () => {
    const filters: ActiveFilters = { brand: ['TechBrand'] };
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, filters);
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(1);
    expect(result?.products[0].name).toBe('Smart TV');
    expect(result?.products[0].brand).toBe('TechBrand');
    expect(result?.facets).toEqual(electronicsMockSource.facets);
  });

  it('should return filtered products for multiple brands (OR logic within brand)', async () => {
    const filters: ActiveFilters = { brand: ['TechBrand', 'AudioMax'] };
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, filters);
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(2);
    const productNames = result!.products.map(p => p.name).sort();
    expect(productNames).toEqual(['Smart TV', 'Wireless Headphones'].sort());
  });

  it('should return filtered products for brand AND size filter (AND logic across groups)', async () => {
    const filters: ActiveFilters = { brand: ['FashionCo'], size: ['M'] };
    const result = await fetchCategoryWithProducts(apparelCategorySlug, filters);
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(1);
    expect(result?.products[0].name).toBe("Men's T-Shirt");
  });

  it('should return empty products array if no products match filters', async () => {
    const filters: ActiveFilters = { brand: ['NonExistentBrand'] };
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, filters);
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(0);
  });

  it('should return null if the category slug does not exist', async () => {
    const result = await fetchCategoryWithProducts('non-existent-slug', {});
    expect(result).toBeNull();
  });

  it('should ignore filter categories with empty arrays in activeFilters', async () => {
    const filters: ActiveFilters = { brand: [], size: ['Large'] };
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, filters);
    expect(result).not.toBeNull();
    expect(result?.products.length).toBe(1);
    expect(result?.products[0].name).toBe('Wireless Headphones');
    expect(result?.products[0].size).toBe('Large');
  });

  it('should sort products by price ascending', async () => {
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, {}, 'price-asc');
    const prices = result!.products.map(p => p.price);
    expect(prices).toEqual([199, 499.99, 799.5]);
  });

  it('should sort products by newest first', async () => {
    const result = await fetchCategoryWithProducts(electronicsCategorySlug, {}, 'newest');
    const ids = result!.products.map(p => p.id);
    expect(ids).toEqual(['prod3', 'prod2', 'prod1']);
  });
});
