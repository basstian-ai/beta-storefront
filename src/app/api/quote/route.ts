import { NextResponse } from 'next/server';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

  const sendgridKey = process.env.SENDGRID_KEY;
  if (sendgridKey) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            { to: [{ email: parsed.data.user.email }] },
          ],
          from: {
            email: process.env.SENDGRID_FROM || 'no-reply@example.com',
          },
          subject: `Quote request ${quoteId}`,
          content: [
            {
              type: 'text/plain',
              value: 'We have received your quote request.',
            },
          ],
        }),
      });
      if (!res.ok) {
        console.error('SendGrid error', await res.text());
      }
    } catch (err) {
      console.error('SendGrid request failed', err);
    }
  }

  return NextResponse.json({ success: true, quoteId });
}
