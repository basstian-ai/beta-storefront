import { buildBreadcrumbs } from '../../lib/buildBreadcrumbs'; // Adjust path as necessary

// Mock the async data fetching functions from buildBreadcrumbs
// Option 1: If they are exported, you can use jest.mock
// Assuming fetchCategoryName and fetchProductName are NOT exported from buildBreadcrumbs.ts
// and are internal to it, we need to mock them differently or test as a black box.
// For this example, buildBreadcrumbs.ts has them as internal, unexported functions.
// So, we rely on their mocked behavior as defined within buildBreadcrumbs.ts itself.
// If these were separate modules, we would do:
// jest.mock('../../lib/api', () => ({
//   ...jest.requireActual('../../lib/api'), // if there are other functions to keep
//   fetchCategoryName: jest.fn(),
//   fetchProductName: jest.fn(),
// }));

// Let's assume the mocks inside buildBreadcrumbs.ts are:
// async function fetchCategoryName(slug: string): Promise<string> {
//   if (slug === 'electronics') return 'Electronics';
//   return 'Mock Category';
// }
// async function fetchProductName(id: string): Promise<string> {
//   if (id === '123') return 'Awesome Gadget';
//   return 'Mock Product';
// }

describe('buildBreadcrumbs Utility', () => {
  beforeEach(() => {
    // Reset mocks if they were external and mockable via jest.mock
    // e.g. (fetchCategoryName as jest.Mock).mockClear();
    // (fetchProductName as jest.Mock).mockClear();
  });

  it('should return only Home for the root path', async () => {
    const segments = await buildBreadcrumbs('/', {});
    expect(segments).toEqual([{ label: 'Home', href: '/' }]);
  });

  it('should generate breadcrumbs for a simple static path', async () => {
    const segments = await buildBreadcrumbs('/about', {});
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]);
  });

  it('should generate breadcrumbs for a category path using mocked fetch', async () => {
    // (fetchCategoryName as jest.Mock).mockResolvedValue('Electronics'); // If external mock
    const segments = await buildBreadcrumbs('/category/electronics', {});
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Electronics', href: '/category/electronics' }, // Uses mocked 'Electronics'
    ]);
  });

  it('should generate breadcrumbs for a product path using mocked fetch', async () => {
    // (fetchProductName as jest.Mock).mockResolvedValue('Awesome Gadget'); // If external mock
    const segments = await buildBreadcrumbs('/product/123', {});
    // This test depends on how buildBreadcrumbs structures product paths.
    // Assuming it's Home > Product Name directly if no category context from path
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Awesome Gadget', href: '/product/123' }, // Uses mocked 'Awesome Gadget'
    ]);
  });

  it('should generate breadcrumbs for a nested product path including category', async () => {
    // (fetchCategoryName as jest.Mock).mockResolvedValue('Electronics');
    // (fetchProductName as jest.Mock).mockResolvedValue('Awesome Laptop');
    const segments = await buildBreadcrumbs('/category/electronics/product/456', {});
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Electronics', href: '/category/electronics' },
      { label: 'Product 456', href: '/category/electronics/product/456' }, // Assumes 'Product 456' if 456 not specifically mocked
    ]);
  });

  it('should handle paths with query parameters (query used for label if logic supports it)', async () => {
    const segments = await buildBreadcrumbs('/search', { q: 'laptops', name: 'Search Results' });
    // The current buildBreadcrumbs uses query.name for the label of the last segment if present
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Search Results', href: '/search' },
    ]);
  });

  it('should handle unknown path parts by capitalizing them', async () => {
    const segments = await buildBreadcrumbs('/unknown/path', {});
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Unknown', href: '/unknown' },
      { label: 'Path', href: '/unknown/path' },
    ]);
  });

   it('should correctly build breadcrumbs for /category/clothing/product/789', async () => {
    // Mock implementations within buildBreadcrumbs are:
    // slug 'electronics' -> 'Electronics'
    // id '123' -> 'Awesome Gadget'
    // Other slugs/ids are capitalized or 'Product {id}'
    const segments = await buildBreadcrumbs('/category/clothing/product/789', {});
    expect(segments).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Clothing', href: '/category/clothing' }, // Capitalized slug
      { label: 'Product 789', href: '/category/clothing/product/789' }, // Default product name
    ]);
  });

});
