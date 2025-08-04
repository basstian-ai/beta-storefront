import AuthGuard from '@/components/AuthGuard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import type { CartItem, Quote } from '@/types';

async function getQuote(id: string): Promise<Quote | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  const baseUrl = process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/quotes/${id}?userId=${session.user.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as Quote;
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await getQuote(params.id);

  if (!quote) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Quote Not Found</h1>
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
        <h1 className="text-3xl font-bold mb-6">Quote {quote.id}</h1>
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
