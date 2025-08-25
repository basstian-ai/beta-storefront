import { NextResponse } from 'next/server';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const QuoteSchema = z.object({
  cart: z.object({
    items: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
      }),
    ),
  }),
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const quoteId = nanoid();
  const session = await getServerSession(authOptions);
  const record = {
    id: quoteId,
    userId: session?.user?.id ?? null,
    status: 'submitted',
    type: 'quote' as const,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  } as const;
  const baseDir = process.env.VERCEL
    ? '/tmp'
    : path.join(process.cwd(), 'data');
  const filePath = path.join(baseDir, 'user-history.json');

  try {
    await fs.mkdir(baseDir, { recursive: true });
    await fs.appendFile(filePath, JSON.stringify(record) + '\n');
  } catch (err) {
    console.error('Failed to write quote', err);
    return NextResponse.json(
      { message: 'Failed to store quote' },
      { status: 500 },
    );
  }

  await sendEmail({
    to: parsed.data.user.email,
    subject: `Quote request ${quoteId}`,
    text: 'We have received your quote request.',
  });

  return NextResponse.json({ success: true, quoteId });
}
