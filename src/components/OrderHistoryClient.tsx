'use client';
import useSWR from 'swr';
import Link from 'next/link';

interface Order {
  id: number;
  total: number;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OrderHistoryClient({ userId }: { userId: string }) {
  const { data, isLoading } = useSWR<Order[]>(`/api/orders?userId=${userId}`, fetcher);

  if (isLoading) {
    return <p>Loading orders…</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-gray-500">You haven’t placed any orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Date</th>
            <th className="px-4 py-2 text-left font-medium">Order #</th>
            <th className="px-4 py-2 text-left font-medium">Total</th>
            <th className="px-4 py-2 text-left font-medium">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(order => (
            <tr key={order.id} className="hover:bg-gray-50 focus-within:bg-gray-50">
              <td className="px-4 py-2">
                <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString()}</time>
              </td>
              <td className="px-4 py-2">{order.id}</td>
              <td className="px-4 py-2">${order.total.toFixed(2)}</td>
              <td className="px-4 py-2">
                <Link href={`/account/orders/${order.id}`} className="text-blue-600 hover:underline" aria-label={`View order ${order.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
