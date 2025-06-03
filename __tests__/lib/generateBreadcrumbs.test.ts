// __tests__/lib/generateBreadcrumbs.test.ts
import { generateBreadcrumbs } from '@/utils/generateBreadcrumbs'; // Assuming this is the correct path

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('generateBreadcrumbs', () => {
  const mockUseRouter = require('next/router').useRouter;

  it('should return only "Home" for the root path', () => {
    mockUseRouter.mockReturnValue({ pathname: '/' });
    const breadcrumbs = generateBreadcrumbs();
    expect(breadcrumbs).toEqual([{ href: '/', label: 'Home' }]);
  });

  it('should return "Home" and "Products" for /products', () => {
    mockUseRouter.mockReturnValue({ pathname: '/products' });
    const breadcrumbs = generateBreadcrumbs();
    expect(breadcrumbs).toEqual([
      { href: '/', label: 'Home' },
      { href: '/products', label: 'Products' },
    ]);
  });

  it('should return "Home", "Foo", "Bar", "Baz" for /foo/bar/baz', () => {
    mockUseRouter.mockReturnValue({ pathname: '/foo/bar/baz' });
    const breadcrumbs = generateBreadcrumbs();
    expect(breadcrumbs).toEqual([
      { href: '/', label: 'Home' },
      { href: '/foo', label: 'Foo' },
      { href: '/foo/bar', label: 'Bar' },
      { href: '/foo/bar/baz', label: 'Baz' },
    ]);
  });

  it('should correctly capitalize labels', () => {
    mockUseRouter.mockReturnValue({ pathname: '/product-category/item-detail' });
    const breadcrumbs = generateBreadcrumbs();
    expect(breadcrumbs).toEqual([
      { href: '/', label: 'Home' },
      { href: '/product-category', label: 'Product-category' },
      { href: '/product-category/item-detail', label: 'Item-detail' },
    ]);
  });

  it('should handle multiple slashes correctly (filter out empty segments)', () => {
    mockUseRouter.mockReturnValue({ pathname: '//foo///bar/' });
    const breadcrumbs = generateBreadcrumbs();
    expect(breadcrumbs).toEqual([
      { href: '/', label: 'Home' },
      { href: '/foo', label: 'Foo' },
      { href: '/foo/bar', label: 'Bar' },
    ]);
  });
});
