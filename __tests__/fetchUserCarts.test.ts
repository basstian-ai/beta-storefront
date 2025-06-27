import { describe, it, expect, vi } from 'vitest';
import { fetchUserCarts } from '../src/lib/orders';

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn().mockResolvedValue([
        { id: 1, createdAt: new Date('2024-01-01') },
        { id: 2, createdAt: new Date('2024-02-01') },
      ]),
    },
  },
}));

const { prisma } = require('../src/lib/prisma');

describe('fetchUserCarts', () => {
  it('calls prisma with user filter and sorting', async () => {
    await fetchUserCarts(7);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 7 },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  });
});
