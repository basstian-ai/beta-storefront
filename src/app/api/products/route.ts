import { createProductService, DEFAULT_LIMIT, ProductServiceError } from '@/lib/services';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const service = createProductService();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') ?? undefined;
  const sort = (searchParams.get('sort') as 'relevance' | 'price_asc' | 'price_desc' | 'newest') ?? 'relevance';
  const skipParam = Number(searchParams.get('skip') ?? '0');
  const limitParam = Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT));
  const brandsParam = searchParams.get('brands');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  const skip = Number.isNaN(skipParam) ? 0 : skipParam;
  const limit = Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam;
  const brands = brandsParam
    ? brandsParam.split(',').map((b) => b.trim()).filter(Boolean)
    : undefined;
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  try {
    const results = await service.listProducts({
      category,
      sort,
      skip,
      limit,
      brands,
      minPrice,
      maxPrice,
    });
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ message: error.message, items: [] }, { status: error.status });
    }
    console.error('Products API error:', error);
    return NextResponse.json(
      { message: 'Error fetching products', items: [] },
      { status: 500 }
    );
  }
}
