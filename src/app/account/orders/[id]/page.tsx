// src/app/account/orders/[id]/page.tsx
import AuthGuard from '@/components/AuthGuard';
import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Product } from '@/types/order';

import { headers } from 'next/headers';

function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

async function getOrderDetails(id: string) {
  const cookie = cookies().toString();
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/${id}`, {
    headers: {
      cookie,
    },
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
        <h1 className="text-3xl font-bold mb-6">Order #{order.id}</h1>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p><strong>Total Items:</strong> {order.totalProducts}</p>
          <p><strong>Total Amount:</strong> ${order.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <ul>
            {order.products.map((product: Product) => (
              <li key={product.id} className="border-b last:border-b-0 py-2">
                <p><strong>{product.title}</strong></p>
                <p>Price: ${product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Total: ${product.total}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6">
          <Link href="/account" className="text-blue-500 hover:underline">
            Back to My Account
          </Link>
        </p>
      </div>
    </AuthGuard>
  );
}
