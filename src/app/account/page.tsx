// src/app/account/page.tsx
import AuthGuard from '@/components/AuthGuard';
import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function getAccountData() {
  const cookie = cookies().toString();
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/account`, {
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
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
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
              {ordersData.carts.map((order: any) => (
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
