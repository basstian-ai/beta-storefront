import AuthGuard from '@/components/AuthGuard';
import AccountTabs from '@/components/AccountTabs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import type { CartItem, Quote } from '@/types';
import { readHistory } from '@/lib/history';

async function getQuote(id: string): Promise<Quote | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  const history = await readHistory();
  return (
    history.find(
      (r) =>
        r.type === 'quote' &&
        r.id === id &&
        String(r.userId) === String(session.user.id),
    ) as Quote | undefined
  ) ?? null;
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await getQuote(params.id);

  if (!quote) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">My Account</h1>
          <AccountTabs active="quotes" />
          <h2 className="text-2xl font-semibold mb-4">Quote Not Found</h2>
          <Link href="/account/quotes" className="text-blue-600 hover:underline">
            Back to Quotes
          </Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <AccountTabs active="quotes" />
        <h2 className="text-2xl font-semibold mb-4">Quote {quote.id}</h2>
        <p className="mb-4">Status: {quote.status}</p>
        {quote.cart?.items?.length > 0 && (
          <ul className="mb-6 list-disc list-inside">
            {quote.cart.items.map((item: CartItem, idx: number) => (
              <li key={idx}>
                Product {item.productId} × {item.quantity}
              </li>
            ))}
          </ul>
        )}
        <Link href="/account/quotes" className="text-blue-600 hover:underline">
          Back to Quotes
        </Link>
      </div>
    </AuthGuard>
  );
}
