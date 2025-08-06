import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, PATCH } from '../src/app/api/shared-cart/route';
import { promises as fs } from 'node:fs';

vi.mock('../src/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(async () => ({ companyId: 'acme', user: { companyId: 'acme' } })),
}));

beforeEach(async () => {
  process.env.VERCEL = '1';
  try {
    await fs.unlink('/tmp/companyHistory.json');
  } catch {}
});

describe('shared cart api', () => {
  it('manages items, status and validates payloads', async () => {
    const initialRes = await GET(new Request('http://localhost/api/shared-cart'));
    expect(initialRes.status).toBe(200);
    const initial = await initialRes.json();
    expect(initial).toEqual({ items: [], status: 'draft' });

    const addRes = await POST(
      new Request('http://localhost/api/shared-cart', {
        method: 'POST',
        body: JSON.stringify({ items: [{ productId: 1, quantity: 2 }] }),
      })
    );
    expect(addRes.status).toBe(200);
    let cart = await addRes.json();
    expect(cart.items).toEqual([{ productId: 1, quantity: 2 }]);

    const updateRes = await POST(
      new Request('http://localhost/api/shared-cart', {
        method: 'POST',
        body: JSON.stringify({ items: [{ productId: 1, quantity: 5 }, { productId: 2, quantity: 1 }] }),
      })
    );
    cart = await updateRes.json();
    expect(cart.items).toEqual([
      { productId: 1, quantity: 5 },
      { productId: 2, quantity: 1 },
    ]);

    const statusRes = await PATCH(
      new Request('http://localhost/api/shared-cart', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'submitted' }),
      })
    );
    cart = await statusRes.json();
    expect(cart.status).toBe('submitted');

    const badRes = await POST(
      new Request('http://localhost/api/shared-cart', {
        method: 'POST',
        body: JSON.stringify({ items: [{ productId: 'bad', quantity: 2 }] }),
      })
    );
    expect(badRes.status).toBe(400);
  });
});
