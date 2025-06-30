import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockResponse = { catalogue: { id: 'p1', name: 'Demo', path: '/demo', defaultVariant: { price: 10, priceVariants: [{ price: 10 }], firstImage: { url: 'img.jpg' } } } };

describe('Crystallize catalogue fetcher', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV, CRYSTALLIZE_TENANT_IDENTIFIER: 'demo', CRYSTALLIZE_ACCESS_TOKEN_ID: 'id', CRYSTALLIZE_ACCESS_TOKEN_SECRET: 'secret' };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) })) as any;
  });

  it('includes tenant slug in request url', async () => {
    const { getProduct } = await import('../lib/pim/catalogue');
    await getProduct('demo');
    expect(fetch).toHaveBeenCalled();
    const url = (fetch as any).mock.calls[0][0];
    expect(url).toContain('/demo/catalogue');
  });
});
