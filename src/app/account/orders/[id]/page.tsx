// src/app/account/orders/[id]/page.tsx
import AuthGuard from '@/components/AuthGuard';
import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { HistoryRecord } from '@/types';
import { readHistory } from '@/lib/history';
import AddToCartButton from '@/components/AddToCartButton';
import { getProductByIdOrSlug } from '@/bff/services';
import type { Product } from '@/types/order';

interface OrderDetails {
  order: HistoryRecord;
  products: Product[];
  total: number;
  totalProducts: number;
}

async function getOrderDetails(id: string): Promise<OrderDetails | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  const history = await readHistory();
  const order = history.find(
    (r) =>
      r.type === 'order' &&
      r.id === id &&
      String(r.userId) === String(session.user.id),
  );
  if (!order) {
    return null;
  }

  const items = order.cart?.items ?? [];
  const products: Product[] = [];
  for (const item of items) {
    try {
      const product = await getProductByIdOrSlug(item.productId);
      const discount = product.discountPercentage ?? 0;
      const discountedPrice = Number(
        (product.price * (1 - discount / 100)).toFixed(2),
      );
      products.push({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        total: product.price * item.quantity,
        discountPercentage: discount,
        discountedPrice,
      });
    } catch (err) {
      console.error('Failed to fetch product details', err);
    }
  }
  const total = products.reduce((sum, p) => sum + p.total, 0);
  return { order, products, total, totalProducts: products.length };
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const details = await getOrderDetails(params.id);

  if (!details) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Order Not Found</h1>
          <p>
            <Link href="/account" className="text-blue-500 hover:underline">
              Back to My Account
            </Link>
          </p>
        </div>
      </AuthGuard>
    );
  }

  const { order, products, total, totalProducts } = details;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order {order.id}</h1>
        <p className="mb-4">Status: {order.status}</p>
        {order.session?.customer?.name && (
          <p className="mb-4">Customer: {order.session.customer.name}</p>
        )}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p>
            <strong>Total Items:</strong> {totalProducts}
          </p>
          <p>
            <strong>Total Amount:</strong> ${total.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Products</h2>
            <AddToCartButton products={products} />
          </div>
          <ul>
            {products.map((product) => (
              <li key={product.id} className="border-b last:border-b-0 py-2">
                <p>
                  <strong>{product.title}</strong>
                </p>
                <p>Price: ${product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Total: ${product.total.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6">
          <Link href="/account" className="text-blue-500 hover:underline">
            Back to My Account
          </Link>
        </p>
      </div>
    </AuthGuard>
  );
}
