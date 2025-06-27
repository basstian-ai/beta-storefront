// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchSvc } from '@/lib/search';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const schema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().optional(),
    perPage: z.coerce.number().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    priceMax: z.coerce.number().optional(),
  });
  const {
    q = '',
    page = 1,
    perPage = 20,
    category,
    brand,
    priceMax,
  } = schema.parse(Object.fromEntries(searchParams));
  const filters = [
    category && `category:=${encodeURIComponent(category)}`,
    brand && `brand:=${encodeURIComponent(brand)}`,
    priceMax && `price:<=${priceMax}`,
  ]
    .filter(Boolean)
    .join(' && ');
  const filterStr = filters || undefined;
  try {
    const results = await searchSvc.search(q, {
      filters: filterStr,
      page,
      perPage,
    });
    const { hits = [], found = 0, facet_counts = [] } = results ?? {};
    type Facet = { field_name: string; counts: { value: string; count: number }[] };
    const facetCounts: Record<string, Record<string, number>> = {};
    for (const f of facet_counts as Facet[]) {
      facetCounts[f.field_name] = {};
      for (const c of f.counts) {
        facetCounts[f.field_name][c.value] = c.count;
      }
    }
    return NextResponse.json({ hits, totalHits: found, page, perPage, facetCounts });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ message: 'Error during search' }, { status: 500 });
  }
}
