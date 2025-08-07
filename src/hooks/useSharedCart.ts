import useSWR from 'swr';
import { fetchProductById } from '@/lib/services/dummyjson';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';
import { useEffect, useState } from 'react';

interface RawCartItem {
  productId: number;
  quantity: number;
}

interface RawSharedCart {
  items: RawCartItem[];
  status: string;
  contributors?: string[];
}

export interface CartItem {
  product: z.infer<typeof ProductSchema>;
  quantity: number;
}

interface SharedCartData {
  items: CartItem[];
  status: string;
  contributors?: string[];
}

interface UseSharedCartResult {
  cart?: SharedCartData;
  isLoading: boolean;
  updateItemQuantity: (
    productId: number,
    quantity: number,
    contributor?: string,
  ) => Promise<void>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<RawSharedCart>);

export function useSharedCart(companyId?: string): UseSharedCartResult {
  const { data, mutate, isLoading } = useSWR(companyId ? '/api/shared-cart' : null, fetcher);
  const [cart, setCart] = useState<SharedCartData>();

  useEffect(() => {
    if (!data) return;
    (async () => {
      const items = await Promise.all(
        data.items.map(async (i) => ({
          product: await fetchProductById(i.productId),
          quantity: i.quantity,
        })),
      );
      setCart({ items, status: data.status, contributors: data.contributors });
    })();
  }, [data]);

  const updateItemQuantity = async (
    productId: number,
    quantity: number,
    contributor?: string,
  ) => {
    await fetch('/api/shared-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId, quantity }], contributor }),
    });
    mutate();
  };

  return { cart, isLoading, updateItemQuantity };
}
