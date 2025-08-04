import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { HistoryRecord } from '@/types';

export const dynamic = 'force-dynamic';

async function readHistory(): Promise<HistoryRecord[]> {
  const baseDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
  const filePath = path.join(baseDir, 'user-history.json');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as HistoryRecord);
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
    const records = await readHistory();
    const orders = records.filter(
      (r) =>
        r.type === 'order' &&
        (!userId || String(r.userId) === String(userId))
    );
    return NextResponse.json(orders);
  } catch (err) {
    console.error('Failed to read orders', err);
    return NextResponse.json(
      { message: 'Failed to load orders' },
      { status: 500 }
    );
  }
}
