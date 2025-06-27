import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../src/app/api/account/orders/route';

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../src/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));

const { prisma } = require('../src/lib/prisma');
const { getServerSession } = require('next-auth');

describe('GET /api/account/orders', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns orders for user', async () => {
    getServerSession.mockResolvedValueOnce({ user: { id: '1' } });
    prisma.order.findMany.mockResolvedValueOnce([
      { id: 2, createdAt: new Date('2024-02-01'), total: 75 },
      { id: 1, createdAt: new Date('2024-01-01'), total: 50 },
    ]);

    const res = await GET(new Request('http://test/api/account/orders'));
    const data = await res.json();
    expect(data.length).toBe(2);
    expect(prisma.order.findMany).toHaveBeenCalled();
  });
});
