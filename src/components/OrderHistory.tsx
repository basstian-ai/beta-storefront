'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import OrderTable from './OrderTable';
import type { HistoryRecord } from '@/types';

interface OrderHistoryProps {
  emptyMessage?: string;
}

export default function OrderHistory({ emptyMessage }: OrderHistoryProps) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/orders?userId=${session.user.id}`)
      .then((res) => res.json())
      .then((data: HistoryRecord[]) => setOrders(data))
      .catch(() => setOrders([]));
  }, [session?.user?.id]);

  return (
    <OrderTable
      items={orders}
      basePath="/account/orders"
      idLabel="Order ID"
      emptyMessage={emptyMessage}
    />
  );
}

