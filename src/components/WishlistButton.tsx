'use client';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';
import { ADD_TO_WISHLIST, SAVED_TO_WISHLIST } from '@/constants/text';

export type Product = z.infer<typeof ProductSchema>;

export default function WishlistButton({ product }: { product: Product }) {
  const items = useWishlistStore((s) => s.items);
  const add = useWishlistStore((s) => s.add);
  const remove = useWishlistStore((s) => s.remove);

  const saved = !!items[product.id];
  const toggle = () => (saved ? remove(product.id) : add(product));

  return (
    <button
      type="button"
      onClick={toggle}
      className="mt-2 flex items-center justify-center w-full border rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart
        className="mr-2 h-5 w-5"
        fill={saved ? 'currentColor' : 'none'}
      />
      {saved ? SAVED_TO_WISHLIST : ADD_TO_WISHLIST}
    </button>
  );
}
