import AuthGuard from '@/components/AuthGuard';
import OrderTable from '@/components/OrderTable';
import AccountTabs from '@/components/AccountTabs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Quote } from '@/types';
import { readHistory } from '@/lib/history';

async function getQuotes(): Promise<Quote[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [] as Quote[];
  }
  const history = await readHistory();
  return history.filter(
    (r) =>
      r.type === 'quote' &&
      String(r.userId) === String(session.user.id),
  ) as Quote[];
}

export default async function QuotesPage() {
  const quotes = await getQuotes();
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
