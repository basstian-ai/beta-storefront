import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/useCartStore';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';

const baseProduct: z.infer<typeof ProductSchema> = {
  id: 1,
  title: 'Test',
  description: 'desc',
  price: 10,
  category: { name: 'Cat', slug: 'cat' },
  slug: 'test-product',
  stock: 5,
  thumbnail: 'http://example.com/img.jpg',
};

const discountedProduct: z.infer<typeof ProductSchema> = {
  ...baseProduct,
  id: 2,
  slug: 'discount',
  price: 100,
  effectivePrice: { amount: 80 },
};

describe('useCartStore basic operations', () => {
  beforeEach(() => {
    useCartStore.setState(useCartStore.getInitialState(), true);
    localStorage.clear();
  });

  it('adds a new item to the cart', () => {
    const { addItem } = useCartStore.getState();
    addItem(baseProduct, 2);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.items[0].pricePerUnit).toBe(10);
    expect(state.getTotalItems()).toBe(2);
  });

  it('increments quantity and caps at stock for existing item', () => {
    const { addItem } = useCartStore.getState();
    addItem(baseProduct, 3);
    addItem(baseProduct, 4); // should cap at stock 5
    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
  });

  it('updates quantity and removes item when set to 0', () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(baseProduct, 1);
    updateQuantity(baseProduct.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes item from cart', () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(baseProduct, 1);
    removeItem(baseProduct.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears cart completely', () => {
    const { addItem, clearCart } = useCartStore.getState();
    addItem(baseProduct, 1);
    clearCart();
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.lastUpdated).not.toBeNull();
  });

  it('calculates subtotal and discount using stored pricePerUnit', () => {
    const { addItem, getCartSubtotal, getCartTotalDiscount } = useCartStore.getState();
    addItem(discountedProduct, 2); // price per unit 80, original 100
    expect(getCartSubtotal()).toBe(160);
    expect(getCartTotalDiscount()).toBe(40);
  });
});
