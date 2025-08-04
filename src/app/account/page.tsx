// src/app/account/page.tsx
import AuthGuard from '@/components/AuthGuard';
import AccountTabs from '@/components/AccountTabs';
import React from 'react';
import Link from 'next/link';
import { Order } from '@/types/order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchUser, fetchUserCarts } from '@/lib/services/dummyjson';

async function getAccountData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return fetchUser(session.user.id);
}

async function getOrders() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { carts: [] };
  }
  return fetchUserCarts(session.user.id);
}

export default async function AccountPage() {
  const accountData = await getAccountData();
  const ordersData = await getOrders();

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <AccountTabs active="orders" />
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
