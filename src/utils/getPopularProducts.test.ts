import { describe, expect, it, vi } from 'vitest';
import { getPopularProducts, type PopularProduct } from './getPopularProducts';

describe('getPopularProducts', () => {
  it('returns five products sorted by rating', async () => {
    const mockProducts: PopularProduct[] = [
      { id: 1, title: 'A', price: 10, discountPercentage: 0, thumbnail: 'a.jpg', rating: 4.5 },
      { id: 2, title: 'B', price: 20, discountPercentage: 0, thumbnail: 'b.jpg', rating: 4.9 },
      { id: 3, title: 'C', price: 30, discountPercentage: 0, thumbnail: 'c.jpg', rating: 3.5 },
      { id: 4, title: 'D', price: 40, discountPercentage: 0, thumbnail: 'd.jpg', rating: 4.2 },
      { id: 5, title: 'E', price: 50, discountPercentage: 0, thumbnail: 'e.jpg', rating: 5 },
    ];
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ products: mockProducts }) })
    ) as unknown as typeof fetch);

    const result = await getPopularProducts();
    expect(result).toHaveLength(5);
    const ratings = result.map(p => p.rating);
    expect(ratings).toEqual([5, 4.9, 4.5, 4.2, 3.5]);
  });
});
