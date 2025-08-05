'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCheckoutSession } from '@/bff/services/stripe';
import type { CheckoutSession } from '@/types/order';

export default function OrderSuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    getCheckoutSession(sessionId)
      .then((s) => {
        setSession(s);
        setError(null);
        fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: s }),
        }).catch((err) => console.error('order record failed', err));
      })
      .catch(() => setError('Failed to load session'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (!sessionId) {
    return <div className="container mx-auto px-4 py-8 text-center">Missing session ID.</div>;
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (error || !session) {
    return <div className="container mx-auto px-4 py-8 text-center">{error || 'No session found'}.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold mb-4">Thanks {session.customer_details?.name || session.customer?.name || 'customer'}!</h1>
      <p className="mb-6">Order #{session.id} confirmed.</p>
      <Link href="/" className="text-blue-600 hover:underline">Back to store</Link>
    </div>
  );
}
