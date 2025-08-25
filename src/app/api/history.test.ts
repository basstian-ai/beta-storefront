import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as postQuote } from './quote/route';
import { GET as getQuotes } from './quotes/route';
import { POST as postOrder } from './order/route';
import { GET as getOrders } from './orders/route';
import { promises as fs } from 'node:fs';

vi.mock('./auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(async () => ({ user: { id: '1' } })),
}));

beforeEach(async () => {
  process.env.VERCEL = '1';
  try {
    await fs.unlink('/tmp/user-history.json');
  } catch {}
});

describe('user history', () => {
  it('stores quotes and orders', async () => {
    const quoteReq = new Request('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        cart: { items: [{ productId: 1, quantity: 2 }] },
        user: { name: 'Test', email: 'test@example.com' },
      }),
    });
    const quoteRes = await postQuote(quoteReq);
    expect(quoteRes.status).toBe(200);

    const quotesRes = await getQuotes(
      new Request('http://localhost/api/quotes?userId=1')
    );
    const quotes = await quotesRes.json();
    expect(quotes.length).toBe(1);
    expect(quotes[0].type).toBe('quote');

    const orderReq = new Request('http://localhost/api/order', {
      method: 'POST',
      body: JSON.stringify({ session: { id: 'sess_1' } }),
    });
    const orderRes = await postOrder(orderReq);
    expect(orderRes.status).toBe(200);

    const ordersRes = await getOrders(
      new Request('http://localhost/api/orders?userId=1')
    );
    const orders = await ordersRes.json();
    expect(orders.length).toBe(1);
    expect(orders[0].type).toBe('order');
  });
});
