import { fetchCategories } from '../../lib/api';
import { Category } from '../../types';

// Mock fetch
global.fetch = jest.fn();

describe('fetchCategories', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Reset console.error and console.warn mocks if they are used in other tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console.error and console.warn
    (console.error as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  });

  it('should fetch and transform categories correctly', async () => {
    const mockData = ['electronics', 'jewelery', "men's clothing"]; // Correctly escaped
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
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server Error'
    });

    await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories');
    expect(console.error).toHaveBeenCalledWith('Failed to fetch categories:', 500, 'Server Error');
  });

  it('should return an empty array if fetched data is not an array', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Not an array' }),
    });

    const categories = await fetchCategories();
    expect(categories).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Fetched data is not an array:', { message: 'Not an array' });
  });

  it('should handle categories with existing name and slug properties', async () => {
    const mockData = [
      { name: 'Home Goods', slug: 'home-goods' },
      'books'
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const categories = await fetchCategories();
    expect(categories).toEqual([
      { id: 'home-goods', name: 'Home Goods', slug: 'home-goods' },
      { id: 'books', name: 'books', slug: 'books' },
    ]);
  });

  it('should filter out null or unexpectedly formatted categories', async () => {
    const mockData = ['valid-category', null, { random: 'object' }, undefined, 123];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const categories = await fetchCategories();
    expect(categories).toEqual([
      { id: 'valid-category', name: 'valid-category', slug: 'valid-category' },
    ]);
    expect(console.warn).toHaveBeenCalledWith('Unexpected category format:', null);
    expect(console.warn).toHaveBeenCalledWith('Unexpected category format:', { random: 'object' });
    expect(console.warn).toHaveBeenCalledWith('Unexpected category format:', undefined);
    expect(console.warn).toHaveBeenCalledWith('Unexpected category format:', 123);
  });
});

// New tests for fetchCategoryWithProducts
import { fetchCategoryWithProducts, CategoryPageData } from '../../lib/api'; // Path confirmed
import MOCK_DATA from '../../../bff/data/mock-category-data.json'; // Path confirmed

// Mock console methods to verify logging for the new suite
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleWarnSpyFetchCategory = jest.spyOn(console, 'warn').mockImplementation(() => {}); // Use a different name to avoid conflict if needed, though Jest handles scope

describe('fetchCategoryWithProducts', () => {
  beforeEach(() => {
    // Clear mock counters before each test
    consoleLogSpy.mockClear();
    consoleWarnSpyFetchCategory.mockClear();
  });

  afterAll(() => {
    // Restore original console functions
    consoleLogSpy.mockRestore();
    consoleWarnSpyFetchCategory.mockRestore();
  });

  it('should return category data for a valid slug', async () => {
    const slug = 'electronics'; // A valid slug from mock-category-data.json
    const expectedData = MOCK_DATA.find(item => item.category.slug === slug);

    const result = await fetchCategoryWithProducts(slug);

    expect(result).toEqual(expectedData);
    expect(result?.category.name).toBe('Electronics');
    expect(result?.products.length).toBeGreaterThan(0);
    expect(result?.facets.brand.length).toBeGreaterThan(0);

    // Verify logging
    expect(consoleLogSpy).toHaveBeenCalledWith(`BFF: Fetching category with products for slug: ${slug}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(`BFF: Found data for slug "${slug}":`, expectedData);
    expect(consoleWarnSpyFetchCategory).not.toHaveBeenCalled();
  });

  it('should return null for an invalid or non-existent slug', async () => {
    const slug = 'non-existent-slug';
    const result = await fetchCategoryWithProducts(slug);

    expect(result).toBeNull();

    // Verify logging
    expect(consoleLogSpy).toHaveBeenCalledWith(`BFF: Fetching category with products for slug: ${slug}`);
    expect(consoleWarnSpyFetchCategory).toHaveBeenCalledWith(`BFF: Category with slug "${slug}" not found.`);
  });

  it('should return correct data structure for a valid slug', async () => {
    const slug = 'apparel'; // Another valid slug
    const result = await fetchCategoryWithProducts(slug);

    expect(result).not.toBeNull();
    // Type guard for TypeScript
    if (result) {
      expect(result.category).toBeDefined();
      expect(result.category.id).toBeDefined();
      expect(result.category.name).toBeDefined();
      expect(result.category.slug).toBe(slug);

      expect(result.products).toBeInstanceOf(Array);
      result.products.forEach(product => {
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.brand).toBeDefined();
        expect(product.size).toBeDefined();
        expect(product.imageUrl).toBeDefined();
      });

      expect(result.facets).toBeDefined();
      expect(result.facets.brand).toBeInstanceOf(Array);
      expect(result.facets.size).toBeInstanceOf(Array);
    }
  });

  // Example test for another category if needed
  it('should correctly fetch data for the "apparel" category', async () => {
    const slug = 'apparel';
    const expectedData = MOCK_DATA.find(item => item.category.slug === slug);
    const result = await fetchCategoryWithProducts(slug);

    expect(result).toEqual(expectedData);
    expect(result?.category.name).toBe('Apparel');
    expect(consoleLogSpy).toHaveBeenCalledWith(`BFF: Fetching category with products for slug: ${slug}`);
  });
});
