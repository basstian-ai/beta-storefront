// src/app/account/page.tsx
import AuthGuard from '@/components/AuthGuard'; // Import the guard
import React from 'react';

// This page will be protected by AuthGuard
// Actual account content will be built in Epic 6 (Quick My Page Shell)

export default function AccountPage() {
  return (
    <AuthGuard> {/* Wrap content with AuthGuard */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder Widgets */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Recent Orders</h2>
            <p className="text-gray-700">(0) - Order history TBD</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Quotes</h2>
            <p className="text-gray-700">(0) - Quotes TBD</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-700">Profile details TBD</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
