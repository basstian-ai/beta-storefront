import { describe, it, expect } from 'vitest';
import { buildBreadcrumbs } from '@root/lib/buildBreadcrumbs';

describe('buildBreadcrumbs', () => {
  it('returns only home segment for root path', async () => {
    const result = await buildBreadcrumbs('/', {} as any);
    expect(result).toEqual([{ label: 'Home', href: '/' }]);
  });

  it('builds category and product segments', async () => {
    const result = await buildBreadcrumbs('/category/electronics/product/123', {} as any);
    expect(result).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Electronics', href: '/category/electronics' },
      { label: 'Awesome Gadget', href: '/category/electronics/product/123' },
    ]);
  });

  it('uses query name when provided', async () => {
    const result = await buildBreadcrumbs('/search/laptop', { name: 'Laptop Results' } as any);
    expect(result).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Laptop Results', href: '/search' },
      { label: 'Laptop Results', href: '/search/laptop' },
    ]);
  });
});
