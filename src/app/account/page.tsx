// src/app/account/page.tsx
import AuthGuard from '@/components/AuthGuard';
import AccountTabs from '@/components/AccountTabs';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchUser } from '@/lib/services/dummyjson';
import OrderTable from '@/components/OrderTable';
import type { HistoryRecord } from '@/types';
import { headers } from 'next/headers';

async function getAccountData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return fetchUser(session.user.id);
}

async function getOrders(): Promise<HistoryRecord[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const res = await fetch(`${protocol}://${host}/api/orders?userId=${session.user.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function AccountPage() {
  const accountData = await getAccountData();
  const orders = await getOrders();

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
          <OrderTable
            items={orders}
            basePath="/account/orders"
            idLabel="Order ID"
            emptyMessage="You have no orders."
          />
        </div>
      </div>
    </AuthGuard>
  );
}
