import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

async function readQuotes() {
  const baseDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
  const filePath = path.join(baseDir, 'quotes.json');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const quotes = await readQuotes();
    const quote = quotes.find(
      (q: any) =>
        q.id === params.id && (!userId || String(q.userId) === String(userId))
    );
    if (!quote) {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(quote);
  } catch (err) {
    console.error('Failed to read quotes', err);
    return NextResponse.json(
      { message: 'Failed to load quote' },
      { status: 500 }
    );
  }
}
