import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/quote/route';

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }));
vi.mock('node:fs', () => {
  const promises = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    appendFile: vi.fn().mockResolvedValue(undefined),
  };
  return { promises, default: { promises } };
});
vi.mock('nanoid', () => ({ nanoid: () => 'test-quote-id' }));

import { getServerSession } from 'next-auth/next';
import { sendEmail } from '@/lib/email';
import { promises as fs } from 'node:fs';

describe('quote API validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'user1' } });
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/quote', { method: 'POST', body: 'not-json' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: 'Invalid JSON' });
  });

  it('returns 400 for invalid payload', async () => {
    const body = { cart: { items: [{ productId: 1, quantity: 0 }] }, user: { name: '', email: 'bad' } };
    const req = new Request('http://localhost/api/quote', { method: 'POST', body: JSON.stringify(body) });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe('Invalid payload');
  });

  it('stores quote and sends email for valid payload', async () => {
    const body = { cart: { items: [{ productId: 1, quantity: 2 }] }, user: { name: 'Alice', email: 'a@example.com' } };
    const req = new Request('http://localhost/api/quote', { method: 'POST', body: JSON.stringify(body) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, quoteId: 'test-quote-id' });
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'a@example.com',
      subject: 'Quote request test-quote-id',
      text: 'We have received your quote request.',
    });
  });
});
