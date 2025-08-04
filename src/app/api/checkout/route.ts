import { NextResponse } from 'next/server';
import { fetchProductById } from '@/lib/services/dummyjson';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface Item {
  productId: number;
  quantity: number;
}

export async function POST(request: Request) {
  let body: { items?: Item[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error('[checkout] Stripe config error', err);
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 },
    );
  }

  const items = body.items;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: 'No items' }, { status: 400 });
  }


  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of items) {
    const product = await fetchProductById(item.productId);
    if (!product) {
      return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 400 });
    }
    line_items.push({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.title,
          images: product.thumbnail ? [product.thumbnail] : undefined,
        },
      },
      quantity: item.quantity,
    });
  }

  const origin = request.headers.get('origin') || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?canceled=1`,
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: 'Free shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
    ],
    automatic_tax: { enabled: false },
  });

  return NextResponse.json({ url: session.url });
}
