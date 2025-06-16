// src/app/api/search/route.ts
import { searchProducts } from '@/bff/services';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term || term.length < 3) {
    return NextResponse.json(
      { items: [], message: 'Search term must be at least 3 characters long' },
      { status: 400 }
    );
  }

  try {
    // The searchProducts service already handles B2B pricing and Zod validation
    const results = await searchProducts(term);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { message: 'Error during product search', items: [] },
      { status: 500 }
    );
  }
}
