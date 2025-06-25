import Link from 'next/link';
import { fetchUserCarts } from '@/lib/fetchUserCarts';

interface OrderHistoryProps {
  userId: string | number;
}

export default async function OrderHistory({ userId }: OrderHistoryProps) {
  const carts = await fetchUserCarts(userId);

  if (!carts.length) {
    return <p className="text-gray-500">You haven’t placed any orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Date</th>
            <th className="px-4 py-2 text-left font-medium">Total</th>
            <th className="px-4 py-2 text-left font-medium">Items</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {carts.map(cart => (
            <tr key={cart.id} className="hover:bg-gray-50 focus-within:bg-gray-50">
              <td className="px-4 py-2">
                <Link
                  href={`/account/orders/${cart.id}`}
                  className="block focus:outline-none"
                  aria-label={`View order ${cart.id}`}
                >
                  <time dateTime={cart.date}>{cart.date}</time>
                </Link>
              </td>
              <td className="px-4 py-2">${cart.total.toFixed(2)}</td>
              <td className="px-4 py-2">{cart.totalProducts}</td>
              <td className="px-4 py-2">Delivered</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
