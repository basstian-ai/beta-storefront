import { NextResponse } from 'next/server';
import { stripe } from '@/lib/getStripe';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ message: 'session_id required' }, { status: 400 });
  }


  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json(session);
  } catch (err) {
    console.error('Stripe retrieve error', err);
    return NextResponse.json({ message: 'Unable to retrieve session' }, { status: 500 });
  }
}
