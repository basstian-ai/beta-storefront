// src/app/api/search/route.ts
import { searchProducts, DEFAULT_LIMIT } from '@/bff/services';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');
  const sort = (searchParams.get('sort') as 'relevance' | 'price-asc' | 'price-desc') ?? 'relevance';
  const skipParam = Number(searchParams.get('skip') ?? '0');
  const limitParam = Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT));
  const skip = Number.isNaN(skipParam) ? 0 : skipParam;
  const limit = Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam;

  if (!term || term.length < 3) {
    return NextResponse.json(
      { items: [], message: 'Search term must be at least 3 characters long' },
      { status: 400 }
    );
  }

  try {
    // The searchProducts service already handles B2B pricing and Zod validation
    const results = await searchProducts(term, sort, skip, limit);
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { message: 'Error during product search', items: [] },
      { status: 500 }
    );
  }
}
