import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/products/route';

vi.mock('@/lib/services', () => ({
  createProductService: vi.fn(),
  DEFAULT_LIMIT: 20,
  ProductServiceError: class extends Error {
    constructor(message: string, public status = 500) {
      super(message);
      this.name = 'ProductServiceError';
    }
  },
}));

import { createProductService, ProductServiceError } from '@/lib/services';

describe('products API route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('forwards query params to service', async () => {
    const listProducts = vi.fn().mockResolvedValue({ items: [], total: 0, skip: 10, limit: 5 });
    (createProductService as any).mockReturnValue({ listProducts });
    const req = new Request('http://localhost/api/products?skip=10&limit=5');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [], total: 0, skip: 10, limit: 5 });
    expect(listProducts).toHaveBeenCalledWith({
      category: undefined,
      sort: 'relevance',
      skip: 10,
      limit: 5,
      brands: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('maps ProductServiceError status', async () => {
    const listProducts = vi.fn().mockRejectedValue(new ProductServiceError('bad', 502));
    (createProductService as any).mockReturnValue({ listProducts });
    const req = new Request('http://localhost/api/products');
    const res = await GET(req as any);
    expect(res.status).toBe(502);
  });
});
