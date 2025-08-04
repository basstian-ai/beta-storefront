'use client';

import AuthGuard from '@/components/AuthGuard';
import OrderTable from '@/components/OrderTable';
import AccountTabs from '@/components/AccountTabs';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { Quote } from '@/types';

export default function QuotesPage() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/quotes?userId=${session.user.id}`)
      .then((res) => res.json())
      .then((data: Quote[]) => setQuotes(data))
      .catch(() => setQuotes([]));
  }, [session?.user?.id]);

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <AccountTabs active="quotes" />
        <OrderTable
          items={quotes}
          basePath="/account/quotes"
          idLabel="Quote ID"
          emptyMessage="You have no quotes."
        />
      </div>
    </AuthGuard>
  );
}

