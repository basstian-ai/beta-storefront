import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const order = await prisma.order.findFirst({
    where: { id: Number(params.id), userId: Number(session.user.id) },
    include: { items: true },
  });
  if (!order) {
    return new NextResponse('Not found', { status: 404 });
  }
  return NextResponse.json(order);
}

export const dynamic = 'force-dynamic';
