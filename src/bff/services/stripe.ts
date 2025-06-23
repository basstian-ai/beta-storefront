import type { CheckoutSession } from '@/types/order';

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  const res = await fetch(`/api/checkout/session?session_id=${sessionId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch checkout session');
  }
  return res.json();
}
