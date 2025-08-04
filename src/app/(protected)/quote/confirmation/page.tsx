'use client';

import AuthGuard from '@/components/AuthGuard';
import { useCartStore } from '@/stores/useCartStore';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function QuoteConfirmationPage() {
  const params = useSearchParams();
  const quoteId = params.get('id');
  const items = useCartStore((state) => state.items);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const subtotal = getCartSubtotal();

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quote Request Submitted</h1>
        {quoteId && (
          <p className="mb-4">
            Your quote ID is <span className="font-mono">{quoteId}</span>.
          </p>
        )}
        {items.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Quote Summary</h2>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.product.id} className="py-2 flex justify-between">
                  <span>
                    {item.product.title} x {item.quantity}
                  </span>
                  <span>
                    $
                    {(
                      (item.product.effectivePrice?.amount ?? item.product.price) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
              <span className="font-medium">Total</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="mb-6">No items in quote.</p>
        )}
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Continue Shopping &rarr;
        </Link>
      </div>
    </AuthGuard>
  );
}

