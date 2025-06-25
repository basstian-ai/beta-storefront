import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  thumbnail?: string;
}

export default async function OrderDetailPage({ params }: { params: { cartId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=/account/orders/${params.cartId}`);
  }

  const res = await fetch(`https://dummyjson.com/carts/${params.cartId}`, { cache: 'no-store' });
  if (!res.ok) {
    return <div className="container mx-auto px-4 py-8">Order not found.</div>;
  }
  const cart = await res.json();
  const products: CartProduct[] = Array.isArray(cart.products) ? cart.products : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Order {params.cartId}</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Product</th>
              <th className="px-4 py-2 text-left font-semibold">Qty</th>
              <th className="px-4 py-2 text-left font-semibold">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 flex items-center gap-2">
                  <Image src={item.thumbnail || '/placeholder-image.webp'} alt={item.title} width={40} height={40} className="rounded" />
                  <span>{item.title}</span>
                </td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/account" className="text-blue-600 hover:underline">Back to account</Link>
    </div>
  );
}
