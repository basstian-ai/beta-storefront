// src/app/account/orders/[id]/page.tsx
import AuthGuard from '@/components/AuthGuard';
import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { HistoryRecord } from '@/types';
import { readHistory } from '@/lib/history';

async function getOrderDetails(id: string): Promise<HistoryRecord | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  const history = await readHistory();
  return (
    history.find(
      (r) =>
        r.type === 'order' &&
        r.id === id &&
        String(r.userId) === String(session.user.id),
    ) ?? null
  );
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
