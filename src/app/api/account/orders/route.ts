import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { userId: Number(session.user.id) },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  return NextResponse.json(orders);
}

export const dynamic = 'force-dynamic';
