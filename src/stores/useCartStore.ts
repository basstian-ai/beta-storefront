// src/stores/useCartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';

// Define the type for a cart item
export interface CartItem {
  product: z.infer<typeof ProductSchema>;
  quantity: number;
  pricePerUnit: number; // Price at the time of adding to cart
}

// Define the state structure for the cart
interface CartState {
  items: CartItem[];
  lastUpdated: number | null;
  // addItem's signature matches the request, quantity is the amount to add
  addItem: (product: z.infer<typeof ProductSchema>, quantityToAdd?: number) => void;
  // updateQuantity's signature matches updateItemQuantity
  updateQuantity: (productId: number, newQuantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartSubtotal: () => number;
  getCartTotalDiscount: () => number; // Added selector for total discount
}

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: null,

      addItem: (product, quantityToAdd = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          const pricePerUnit = product.effectivePrice?.amount ?? product.price;
          let newItems;

          if (existingItemIndex > -1) {
            newItems = state.items.map((item, index) => {
              if (index === existingItemIndex) {
                let newQuantity = item.quantity + quantityToAdd;
                // Check stock if available
                if (item.product.stock !== undefined && newQuantity > item.product.stock) {
                  newQuantity = item.product.stock; // Cap at stock
                  // Optionally: log a warning or prepare a notification for UI
                  console.warn(`Quantity for ${item.product.title} capped at stock limit: ${item.product.stock}`);
                }
                return { ...item, quantity: newQuantity, pricePerUnit }; // Ensure pricePerUnit is updated if product details change
              }
              return item;
            });
          } else {
            let newQuantity = quantityToAdd;
            // Check stock for new item
            if (product.stock !== undefined && newQuantity > product.stock) {
              newQuantity = product.stock; // Cap at stock
              console.warn(`Quantity for new item ${product.title} capped at stock limit: ${product.stock}`);
            }
            if (newQuantity <= 0) { // Do not add if capped quantity is 0 or less (e.g. out of stock)
                return { items: state.items }; // No change
            }
            newItems = [...state.items, { product, quantity: newQuantity, pricePerUnit }];
          }
          return { items: newItems, lastUpdated: Date.now() };
        });
      },

      // Renamed updateItemQuantity to updateQuantity to match subtask request.
      updateQuantity: (productId, newQuantity) => {
        set((state) => {
          if (newQuantity <= 0) {
            // Remove item if new quantity is 0 or less
            return {
              items: state.items.filter((item) => item.product.id !== productId),
              lastUpdated: Date.now(),
            };
          }
          return {
            items: state.items.map((item) => {
              if (item.product.id === productId) {
                let updatedQuantity = newQuantity;
                // Check stock if available
                if (item.product.stock !== undefined && updatedQuantity > item.product.stock) {
                  updatedQuantity = item.product.stock; // Cap at stock
                  console.warn(`Quantity for ${item.product.title} capped at stock limit: ${item.product.stock}`);
                }
                return { ...item, quantity: updatedQuantity };
              }
              return item;
            }),
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
          // Use the stored pricePerUnit for subtotal calculation
          return total + item.pricePerUnit * item.quantity;
        }, 0);
      },

      getCartTotalDiscount: () => {
        const { items, getCartSubtotal } = get();
        const totalOriginalPrice = items.reduce((total, item) => {
          // item.product.price is the original, non-discounted price from the product data
          return total + item.product.price * item.quantity;
        }, 0);
        return totalOriginalPrice - getCartSubtotal();
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
