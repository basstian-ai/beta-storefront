import { getProductByIdOrSlug } from '@/bff/services';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductByIdOrSlug(params.id);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}
