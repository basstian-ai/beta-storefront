import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';

export type Product = z.infer<typeof ProductSchema>;

interface WishlistState {
  items: Record<number, Product>;
  add: (product: Product) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

const initialState: Pick<WishlistState, 'items'> = {
  items: {},
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ...initialState,
      add: (product) =>
        set((state) => ({ items: { ...state.items, [product.id]: product } })),
      remove: (productId) =>
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[productId];
          return { items: newItems };
        }),
      clear: () => set({ ...initialState }),
    }),
    {
      name: 'beta-wishlist-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

