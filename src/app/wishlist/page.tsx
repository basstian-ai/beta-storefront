'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { EMPTY_WISHLIST_MESSAGE, CONTINUE_SHOPPING } from '@/constants/text';
import { HeartOff } from 'lucide-react';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.addItem);

  const list = Object.values(items);

  if (list.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-700 mb-4">{EMPTY_WISHLIST_MESSAGE}</p>
        <Link href="/" className="text-lg text-blue-600 hover:text-blue-800 font-medium">
          {CONTINUE_SHOPPING}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {list.map((product) => (
        <div key={product.id} className="flex items-center border p-4 rounded-md shadow bg-white">
          <Image
            src={product.thumbnail || '/placeholder-image.webp'}
            alt={product.title}
            width={80}
            height={80}
            className="rounded-md mr-4 object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{product.title}</h3>
            <p className="text-sm text-gray-500">${(product.effectivePrice?.amount ?? product.price).toFixed(2)}</p>
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            className="mr-3 rounded-md bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700"
          >
            Add to cart
          </button>
          <button
            onClick={() => remove(product.id)}
            className="text-gray-500 hover:text-red-600"
            aria-label="Remove from wishlist"
          >
            <HeartOff className="h-5 w-5" />
          </button>
        </div>
      ))}
      {list.length > 1 && (
        <div className="text-right">
          <button onClick={clear} className="text-sm text-red-600 hover:text-red-800">
            Clear Wishlist
          </button>
        </div>
      )}
    </div>
  );
}
