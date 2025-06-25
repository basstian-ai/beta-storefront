import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchUserCarts } from './fetchUserCarts';

global.fetch = vi.fn();

describe('fetchUserCarts', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches carts and sorts by newest', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        carts: [
          { id: 1, total: 50, totalProducts: 1, totalQuantity: 2, date: '2023-01-01' },
          { id: 2, total: 75, totalProducts: 3, totalQuantity: 4, date: '2023-06-01' }
        ]
      }),
    } as Response);

    const carts = await fetchUserCarts(5);
    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/carts/user/5', { cache: 'no-store' });
    expect(carts[0].id).toBe(2);
    expect(carts[1].id).toBe(1);
  });
});
