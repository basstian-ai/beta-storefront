import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Quote } from '@/types';

export const dynamic = 'force-dynamic';

async function readQuotes(): Promise<Quote[]> {
  const baseDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
  const filePath = path.join(baseDir, 'quotes.json');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Quote);
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const quotes = await readQuotes();
    const filtered = userId
      ? quotes.filter((q) => String(q.userId) === String(userId))
      : quotes;
    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Failed to read quotes', err);
    return NextResponse.json(
      { message: 'Failed to load quotes' },
      { status: 500 }
    );
  }
}
