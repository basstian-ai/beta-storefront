// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchSvc } from '@/lib/search';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || '1');
  const perPage = Number(searchParams.get('perPage') || '20');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const priceMax = searchParams.get('priceMax');
  const filters: string[] = [];
  if (category) filters.push(`category:=${category}`);
  if (brand) filters.push(`brand:=${brand}`);
  if (priceMax) filters.push(`price:<=${priceMax}`);
  const filterStr = filters.length ? filters.join(' && ') : undefined;
  try {
    const results = await searchSvc.search(q, { filters: filterStr, page, perPage });
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ message: 'Error during search' }, { status: 500 });
  }
}
