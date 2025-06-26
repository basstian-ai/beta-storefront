import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const { blob } = await get('orders/demo-orders.json');
  const orders = await blob.json();
  return NextResponse.json({ orders });
}
