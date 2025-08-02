import { getProduct } from '@/bff/products';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProduct(params.id);
    return NextResponse.json(product);
  } catch (error) {
    return new Response('Error fetching product', { status: 500 });
  }
}
