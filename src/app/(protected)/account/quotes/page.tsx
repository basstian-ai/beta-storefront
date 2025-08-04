import AuthGuard from '@/components/AuthGuard';
import OrderTable from '@/components/OrderTable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Quote } from '@/types';

async function getQuotes(): Promise<Quote[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [] as Quote[];
  }
  const baseUrl = process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/quotes?userId=${session.user.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return [] as Quote[];
  }
  return res.json();
}

export default async function QuotesPage() {
  const quotes = await getQuotes();
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Quotes</h1>
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
