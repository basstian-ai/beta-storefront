import {
  fetchCategories, // Keep this if fetchCategories tests are to remain
  fetchCategoryWithProducts,
  CategoryPageData,
  Product,
  Category as ApiCategory,  // Renaming to avoid conflict with Category from ../types if used by fetchCategories
  Facets
} from '@/lib/api'; // Using @ alias assuming it's configured for __tests__
import { Category as ImportedCategoryType } from '../../types'; // Original import for fetchCategories test
import { ActiveFilters } from '@/components/FacetFilters';
import MOCK_CATEGORIES_DATA_JSON from '../../../bff/data/mock-category-data.json';

// Mock fetch for fetchCategories if those tests are kept
global.fetch = jest.fn();

// Existing tests for fetchCategories (assuming they are to be kept)
describe('fetchCategories', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
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


// Updated tests for fetchCategoryWithProducts (BFF Filtering Logic)
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

const electronicsCategorySlug = 'electronics';
const electronicsMockSource = MOCK_CATEGORIES_DATA_JSON.find(d => d.category.slug === electronicsCategorySlug)! as unknown as CategoryPageData; // Cast for test purposes

const apparelCategorySlug = 'apparel';
const apparelMockSource = MOCK_CATEGORIES_DATA_JSON.find(d => d.category.slug === apparelCategorySlug)! as unknown as CategoryPageData; // Cast for test purposes

describe('fetchCategoryWithProducts - BFF Filtering Logic (Updated Tests)', () => {
  beforeEach(() => {
    // Clear only the spies relevant to this describe block if console is shared
    // However, the new spies are global, so clearing them is fine.
    consoleLogSpy.mockClear();
    consoleWarnSpy.mockClear();
     // If fetch is used by other tests ensure it's reset or specifically mocked for fetchCategoryWithProducts if it were to use fetch
  });

  afterAll(() => {
    // Restore global spies
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
});
