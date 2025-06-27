import { prisma } from './prisma';

export async function fetchUserCarts(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}
