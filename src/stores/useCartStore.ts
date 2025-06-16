// src/stores/useCartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';

// Define the type for a cart item
export interface CartItem {
  product: z.infer<typeof ProductSchema>;
  quantity: number;
}

// Define the state structure for the cart
interface CartState {
  items: CartItem[];
  lastUpdated: number | null;
  addItem: (product: z.infer<typeof ProductSchema>, quantity?: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartSubtotal: () => number;
}

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          let newItems;
          if (existingItemIndex > -1) {
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { product, quantity }];
          }
          return { items: newItems, lastUpdated: Date.now() };
        });
      },

      updateItemQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
              lastUpdated: Date.now(),
            };
          }
          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
            lastUpdated: Date.now(),
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
          lastUpdated: Date.now(),
        }));
      },

      clearCart: () => {
        set({ items: [], lastUpdated: Date.now() }); // Ensures lastUpdated is set on clear
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.effectivePrice?.amount ?? item.product.price;
          return total + price * item.quantity;
        }, 0);
      }
    }),
    {
      name: 'cart_v1', // Storage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => { // Outer function called once on setup
        console.log('Cart store: Setting up rehydration listener.');
        return (restoredState, error) => { // This listener is called with the state from storage
          if (error) {
            console.error('Cart store: Error during rehydration:', error);
            // If there's an error, persist middleware will use the initial state.
            // We don't need to return anything specific here for that default behavior.
            return;
          }
          if (restoredState) {
            console.log('Cart store: Successfully read stored state for rehydration check.');
            const now = Date.now();
            if (restoredState.lastUpdated && (now - restoredState.lastUpdated > SEVEN_DAYS_IN_MS)) {
              console.log('Cart store: Persisted cart data is expired. Rehydrating with cleared items.');
              // Set only the persisted parts of the state, merging with existing actions.
              useCartStore.setState({ items: [], lastUpdated: null });
            } else {
              console.log('Cart store: Persisted cart data is valid. Proceeding with stored state.');
              // If data is valid, the persist middleware itself will have applied 'restoredState'.
              // If we needed to manually set it here (e.g. if not using the built-in hydration part of persist),
              // it should also be a merge: useCartStore.setState(restoredState);
              // Or, can explicitly return restoredState: return restoredState;
            }
          } else {
            console.log('Cart store: No previous cart state found in storage. Initializing with default state.');
            // No state to restore, persist middleware will use initial state.
          }
        };
      },
      partialize: (state) => ({ items: state.items, lastUpdated: state.lastUpdated }),
    }
  )
);
