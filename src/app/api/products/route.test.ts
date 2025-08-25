import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/products/route';

vi.mock('@/bff/services', () => ({
  getProducts: vi.fn(),
  DEFAULT_LIMIT: 20,
}));

import { getProducts } from '@/bff/services';

describe('products API route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('forwards query params to service', async () => {
    (getProducts as any).mockResolvedValue({ items: [], total: 0, skip: 10, limit: 5 });
    const req = new Request('http://localhost/api/products?skip=10&limit=5');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [], total: 0, skip: 10, limit: 5 });
    expect((getProducts as any)).toHaveBeenCalledWith({
      category: undefined,
      sort: 'relevance',
      skip: 10,
      limit: 5,
      brands: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('returns 500 on error', async () => {
    (getProducts as any).mockRejectedValue(new Error('bad'));
    const req = new Request('http://localhost/api/products');
    const res = await GET(req as any);
    expect(res.status).toBe(500);
  });
});
