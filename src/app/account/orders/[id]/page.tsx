// src/app/account/orders/[id]/page.tsx
import AuthGuard from '@/components/AuthGuard';
import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { headers } from 'next/headers';
import type { HistoryRecord } from '@/types';

async function getOrderDetails(id: string): Promise<HistoryRecord | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const res = await fetch(`${protocol}://${host}/api/orders/${id}?userId=${session.user.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderDetails(params.id);

  if (!order) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Order Not Found</h1>
          <p>
            <Link href="/account" className="text-blue-500 hover:underline">
              Back to My Account
            </Link>
          </p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order {order.id}</h1>
        <p className="mb-4">Status: {order.status}</p>
        {order.session?.customer?.name && (
          <p className="mb-4">Customer: {order.session.customer.name}</p>
        )}
        <Link href="/account" className="text-blue-500 hover:underline">
          Back to My Account
        </Link>
      </div>
    </AuthGuard>
  );
}
