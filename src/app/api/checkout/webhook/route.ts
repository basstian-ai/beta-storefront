import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, validateStripeEnv } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const { STRIPE_WEBHOOK_SECRET } = validateStripeEnv();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature || '', STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] signature error', err);
    return new NextResponse('Signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
      const order = await prisma.order.create({
        data: {
          userId: String(session.client_reference_id || ''),
          email: session.customer_email || '',
          total: (session.amount_total || 0) / 100,
          items: lineItems.data.map(li => ({
            description: li.description,
            quantity: li.quantity,
            amount_total: li.amount_total,
            price_id: li.price?.id,
          })),
        },
      });
      return NextResponse.json({ received: true, order });
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';
