// __tests__/unit/lib/generateBreadcrumbs.test.ts
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs';

describe('generateBreadcrumbs', () => {
  it('returns Home for the root path', () => {
    const breadcrumbs = generateBreadcrumbs('/');
    expect(breadcrumbs).toEqual([{ name: 'Home', href: '/' }]);
  });

  it('handles category paths with dynamic data', () => {
    const breadcrumbs = generateBreadcrumbs('/category/electronics', {
      category: { name: 'Electronics', slug: 'electronics' },
    });
    expect(breadcrumbs).toEqual([
      { name: 'Home', href: '/' },
      { name: 'Categories', href: '/category' },
      { name: 'Electronics', href: '/category/electronics' },
    ]);
  });

  it('handles product paths nested in a category', () => {
    const breadcrumbs = generateBreadcrumbs('/category/electronics/product/phone', {
      category: { name: 'Electronics', slug: 'electronics' },
      productTitle: 'Smartphone',
    });
    expect(breadcrumbs).toEqual([
      { name: 'Home', href: '/' },
      { name: 'Categories', href: '/category' },
      { name: 'Electronics', href: '/category/electronics' },
      { name: 'Smartphone', href: '/category/electronics/product/phone' },
    ]);
  });
});
