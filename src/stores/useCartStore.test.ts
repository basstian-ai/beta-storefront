// src/stores/useCartStore.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCartStore, CartItem } from './useCartStore';
import { ProductSchema, PriceSchema } from '@/bff/types';
import { z } from 'zod';

// Mock product data
const mockProduct1: z.infer<typeof ProductSchema> = {
  id: 1,
  title: 'Test Product 1',
  price: 10.00,
  category: 'electronics',
  description: 'Test desc 1',
  slug: 'test-product-1',
  stock: 10,
  brand: 'TestBrand',
  discountPercentage: 0,
  images: ['http://example.com/image1.jpg'],
  rating: 4.5,
  thumbnail: 'http://example.com/thumb1.jpg',
  // effectivePrice is optional, so it can be omitted if not relevant for a specific test setup
  // or included if testing logic that depends on it.
  // For persistence tests, its presence or absence should be handled by the store.
};

const mockProduct2: z.infer<typeof ProductSchema> = {
  id: 2,
  title: 'Test Product 2',
  price: 20.00,
  category: 'electronics',
  description: 'Test desc 2',
  slug: 'test-product-2',
  stock: 5,
  brand: 'TestBrand',
  discountPercentage: 0,
  images: ['http://example.com/image2.jpg'],
  rating: 4,
  thumbnail: 'http://example.com/thumb2.jpg',
};

// Helper to get the raw string that would be stored by persist middleware
// This is a simplified version; actual serialization might include versioning.
// The key part is that `state` contains `items` and `lastUpdated`.
const getPersistedStateString = (state: { items: CartItem[], lastUpdated: number | null }) => {
  return JSON.stringify({ state, version: 0 }); // Zustand persist typically includes a version
};


describe('useCartStore with localStorage persistence', () => {
  let localStorageStore: Record<string, string> = {};

  const localStorageMock: Storage = {
    getItem: vi.fn((key: string) => localStorageStore[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageStore[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageStore[key];
    }),
    clear: vi.fn(() => {
      localStorageStore = {};
    }),
    key: vi.fn((index: number) => Object.keys(localStorageStore)[index] || null),
    get length() { // Use a getter for length
      return Object.keys(localStorageStore).length;
    }
  };

  beforeEach(() => {
    // Reset store to initial state
    useCartStore.setState(useCartStore.getInitialState(), true);

    // Clear and mock localStorage
    localStorageStore = {}; // Clear the in-memory store for the mock
    vi.stubGlobal('localStorage', localStorageMock);

    // Clear any actual persisted state in the store's memory from previous tests or runs
    // This is important if the store instance is a true singleton across test files (depends on Vitest config)
    // @ts-ignore - Accessing private_internal_getInitialState if possible, or just reset
    if (useCartStore.persist && typeof useCartStore.persist.clearStorage === 'function') {
      useCartStore.persist.clearStorage(); // Clears from actual configured storage if method exists
    }
    // And ensure in-memory is reset again after any persist-internal clears
    useCartStore.setState(useCartStore.getInitialState(), true);
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // Restore original localStorage
    // Clean up any persisted state by the store from the mock
    localStorageMock.removeItem('cart_v1');
    useCartStore.setState(useCartStore.getInitialState(), true); // Reset for next test suite
  });

  // Helper function to simulate the rehydration process
  const simulateRehydration = () => {
    const persistedStateJSON = localStorageMock.getItem('cart_v1');
    if (persistedStateJSON) {
      try {
        const persistedStateContainer = JSON.parse(persistedStateJSON);
        const stateFromStorage = persistedStateContainer.state; // Assuming structure { state: ..., version: ... }

        // Get the onRehydrateStorage listener
        const onRehydrateFn = useCartStore.persist.getOptions().onRehydrateStorage;
        if (onRehydrateFn) {
          const listener = onRehydrateFn(); // This should return the (restoredState, error) => ... function
          // Call the listener with the state read from storage
          listener(stateFromStorage, null);
          // Note: The listener itself calls useCartStore.setState if TTL is expired.
          // If not expired, the persist middleware would have already set the state.
          // If it was expired and listener called setState, the store is updated.
          // If it was not expired, the store was already updated by persist middleware before this listener.
          // This simulation relies on the listener correctly modifying the store *if needed*.
        } else {
          // If no onRehydrateStorage, persist middleware would just set the state.
          if (stateFromStorage) {
            useCartStore.setState(stateFromStorage, true);
          }
        }
      } catch (e) {
        console.error("Test Rehydration Error: Failed to parse or apply persisted state.", e);
      }
    } else {
        // No state in localStorage, store should remain in its initial state after this.
        // (which it was reset to in beforeEach)
    }
  };


  it('should persist items to localStorage and rehydrate on load', () => {
    // 1. Add items to the store
    useCartStore.getState().addItem(mockProduct1, 2);
    useCartStore.getState().addItem(mockProduct2, 1);

    expect(useCartStore.getState().items.length).toBe(2);
    // Check if setItem was called (localStorageMock tracks calls)
    // We expect it to be called multiple times due to each addItem and internal updates.
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cart_v1', expect.any(String));

    // Verify content of what was stored (last call to setItem)
    const lastStoredValue = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1];
    const parsedLastStoredValue = JSON.parse(lastStoredValue);
    expect(parsedLastStoredValue.state.items.length).toBe(2);
    expect(parsedLastStoredValue.state.items.find((i: CartItem) => i.product.id === mockProduct1.id)?.quantity).toBe(2);
    expect(parsedLastStoredValue.state.items.find((i: CartItem) => i.product.id === mockProduct2.id)?.quantity).toBe(1);
    expect(parsedLastStoredValue.state.lastUpdated).toBeTypeOf('number');

    // 2. Simulate store re-initialization / page reload for rehydration
    // Reset the current in-memory state of the store to initial to force rehydration from mock
    useCartStore.setState(useCartStore.getInitialState(), true);

    // Simulate rehydration based on what's in localStorageMock
    simulateRehydration();

    const rehydratedState = useCartStore.getState();
    expect(rehydratedState.items.length).toBe(2);
    expect(rehydratedState.items.find(item => item.product.id === mockProduct1.id)?.quantity).toBe(2);
    expect(rehydratedState.items.find(item => item.product.id === mockProduct2.id)?.quantity).toBe(1);
    expect(rehydratedState.getTotalItems()).toBe(3);
  });

  it('should clear expired cart data on rehydration (TTL check)', () => {
    const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
    const expiredTimestamp = Date.now() - SEVEN_DAYS_IN_MS - 1000;

    // 1. Simulate an expired cart in localStorage
    const expiredCartStateForStorage = {
      items: [{ product: mockProduct1, quantity: 1 }],
      lastUpdated: expiredTimestamp
    };
    localStorageMock.setItem('cart_v1', getPersistedStateString(expiredCartStateForStorage));

    // 2. Simulate store re-initialization and rehydration
    useCartStore.setState(useCartStore.getInitialState(), true);
    simulateRehydration();

    // 3. Check if the cart is empty after rehydration due to TTL
    const rehydratedStateTTL = useCartStore.getState();
    expect(rehydratedStateTTL.items.length).toBe(0);
    expect(rehydratedStateTTL.lastUpdated).toBeNull();
  });
});
