import { NextResponse } from 'next/server';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

const OrderSchema = z.object({
  session: z.object({
    id: z.string(),
    customer: z.object({ name: z.string().nullable().optional() }).nullable().optional(),
  }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  const record = {
    id: parsed.data.session.id,
    userId: session?.user?.id ?? null,
    type: 'order' as const,
    status: 'paid',
    createdAt: new Date().toISOString(),
    session: parsed.data.session,
  };

  const baseDir = process.env.VERCEL
    ? '/tmp'
    : path.join(process.cwd(), 'data');
  const filePath = path.join(baseDir, 'user-history.json');

  try {
    await fs.mkdir(baseDir, { recursive: true });
    await fs.appendFile(filePath, JSON.stringify(record) + '\n');
  } catch (err) {
    console.error('Failed to write order', err);
    return NextResponse.json(
      { message: 'Failed to store order' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, orderId: record.id });
}
