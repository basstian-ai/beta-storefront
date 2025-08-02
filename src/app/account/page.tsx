// src/app/account/page.tsx
import AuthGuard from '@/components/AuthGuard';
import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Order } from '@/types/order';

import { headers } from 'next/headers';

function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

async function getAccountData() {
  const cookie = cookies().toString();
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/account`, {
    headers: {
      cookie,
    },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function getOrders() {
  const cookie = cookies().toString();
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders`, {
    headers: {
      cookie,
    },
  });
  if (!res.ok) {
    return { carts: [] };
  }
  return res.json();
}

export default async function AccountPage() {
  const accountData = await getAccountData();
  const ordersData = await getOrders();

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        {accountData && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p><strong>First Name:</strong> {accountData.firstName}</p>
            <p><strong>Last Name:</strong> {accountData.lastName}</p>
            <p><strong>Email:</strong> {accountData.email}</p>
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Orders</h2>
          {ordersData?.carts?.length > 0 ? (
            <ul>
              {ordersData.carts.map((order: Order) => (
                <li key={order.id} className="border-b last:border-b-0 py-2">
                  <Link href={`/account/orders/${order.id}`} className="text-blue-500 hover:underline">
                    Order #{order.id} - ${order.total}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">You have no orders.</p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
