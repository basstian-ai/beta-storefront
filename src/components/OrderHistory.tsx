
'use client';
import useSWR from 'swr';
import Link from 'next/link';
import type { Order, OrderItem } from '@prisma/client';

type OrderWithItems = Order & { items: OrderItem[] };

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OrderHistory() {
  const { data: orders, isLoading } = useSWR<OrderWithItems[]>('/api/account/orders', fetcher);

  if (isLoading) {
    return <p>Loading orders…</p>;
  }

  if (!orders?.length) {
    return <p className="text-gray-500">You haven’t placed any orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Order #</th>
            <th className="px-4 py-2 text-right">Total</th>
            <th className="px-4 py-2 text-right sr-only">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order: OrderWithItems) => (
            <tr key={order.id} tabIndex={0} className="hover:bg-gray-50 focus:outline-none">
              <td className="px-4 py-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 font-medium">#{order.id}</td>
              <td className="px-4 py-2 text-right">${(order.total / 100).toFixed(2)}</td>
              <td className="px-4 py-2 text-right">
                <Link href={`/account/orders/${order.id}`} aria-label={`View order ${order.id}`} className="text-blue-600 hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
