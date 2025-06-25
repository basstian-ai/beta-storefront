'use client';
import Link from 'next/link';
import type { Cart } from '@/lib/fetchUserCarts';

interface Props {
  carts: Cart[];
}

export default function OrderHistory({ carts }: Props) {
  if (!carts || carts.length === 0) {
    return <p>No orders yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-4 py-2 text-left font-semibold">Date</th>
            <th scope="col" className="px-4 py-2 text-left font-semibold">Total</th>
            <th scope="col" className="px-4 py-2 text-left font-semibold">Items</th>
            <th scope="col" className="px-4 py-2 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {carts.map((cart) => (
            <tr key={cart.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 focus-within:bg-gray-100" tabIndex={0}>
              <td className="px-4 py-2">
                <Link href={`/account/orders/${cart.id}`} aria-label={`Order ${cart.id}`} className="block w-full">
                  {cart.date ? new Date(cart.date).toLocaleDateString() : 'N/A'}
                </Link>
              </td>
              <td className="px-4 py-2">${cart.total.toFixed(2)}</td>
              <td className="px-4 py-2">{cart.totalQuantity}</td>
              <td className="px-4 py-2">Delivered</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
