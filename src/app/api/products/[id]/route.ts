import { createProductService, ProductServiceError } from '@/lib/services';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const service = createProductService();
  try {
    const product = await service.getProduct(params.id);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error('Product API error:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}
