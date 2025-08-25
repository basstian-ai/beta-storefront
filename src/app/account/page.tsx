// src/app/account/page.tsx
import AuthGuard from '@/components/AuthGuard';
import AccountTabs from '@/components/AccountTabs';
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authAdapter } from '@/adapters/auth';
import OrderHistory from '@/components/OrderHistory';

async function getAccountData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return authAdapter.getUser(session.user.id);
}

export default async function AccountPage() {
  const accountData = await getAccountData();

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
          <OrderHistory emptyMessage="You have no orders." />
        </div>
      </div>
    </AuthGuard>
  );
}
