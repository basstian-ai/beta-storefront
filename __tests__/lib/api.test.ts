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
