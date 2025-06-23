import { describe, it, expect, vi } from 'vitest';
import { POST } from '../src/app/api/checkout/route';

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: { sessions: { create: vi.fn(() => Promise.resolve({ url: 'https://stripe.test/checkout' })) } },
    })),
  };
});

vi.mock('../src/bff/adapters/dummyjson', () => ({
  fetchProductById: vi.fn(async (id: number) => ({ id, title: 'Test', price: 10, thumbnail: 'img' })),
}));

describe('POST /api/checkout', () => {
  it('returns checkout url', async () => {
    const req = {
      json: async () => ({ items: [{ productId: 1, quantity: 2 }] }),
      headers: new Headers({ origin: 'http://localhost:3000' }),
      url: 'http://localhost:3000/api/checkout',
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();
    expect(data.url).toBe('https://stripe.test/checkout');
  });
});
