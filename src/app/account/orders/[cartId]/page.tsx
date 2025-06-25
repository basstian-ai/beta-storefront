import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  description: string | null;
  quantity: number | null;
  amount_total: number | null;
  price_id?: string | null;
}

export default async function OrderDetailPage({ params }: { params: { cartId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=/account/orders/${params.cartId}`);
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/orders/${params.cartId}`, { cache: 'no-store' });
  if (!res.ok) {
    return <div className="container mx-auto px-4 py-8">Order not found.</div>;
  }
  const order = await res.json();
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Order {params.cartId}</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Item</th>
              <th className="px-4 py-2 text-left font-semibold">Qty</th>
              <th className="px-4 py-2 text-left font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">${((item.amount_total || 0) / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/account" className="text-blue-600 hover:underline">Back to account</Link>
    </div>
  );
}
