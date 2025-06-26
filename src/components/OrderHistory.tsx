'use client';
import { use } from 'react';
import { getOrderHistory } from '@/lib/orders';

export default function OrderHistory() {
  const orders = use(getOrderHistory());

  if (!orders.length) {
    return <p className="text-gray-500">You haven\u2019t placed any orders yet.</p>;
  }

  return (
    <section className="divide-y divide-gray-200 border rounded-md">
      {orders.map(order => (
        <article key={order.id} className="p-4 flex flex-col gap-2">
          <header className="flex justify-between items-center">
            <span className="font-medium">#{order.id}</span>
            <time dateTime={order.date}>{order.date}</time>
          </header>

          <div className="text-sm text-gray-600">
            {order.items} items \u2022 ${order.total}
          </div>
        </article>
      ))}
    </section>
  );
}
