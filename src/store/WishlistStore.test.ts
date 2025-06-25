// src/store/WishlistStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWishlistStore } from './wishlist';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';

const mockProduct: z.infer<typeof ProductSchema> = {
  id: 1,
  title: 'Test Product',
  price: 10,
  description: 'desc',
  category: { name: 'Cat', slug: 'cat' },
  slug: 'test-product',
  images: [],
  thumbnail: '',
  rating: 4,
};

beforeEach(() => {
  useWishlistStore.setState(useWishlistStore.getInitialState(), true);
  localStorage.clear();
  if (vi.isMockFunction(localStorage.setItem)) localStorage.setItem.mockClear();
});

describe('Wishlist store persistence', () => {
  it('persists items after re-init', () => {
    useWishlistStore.getState().add(mockProduct);
    expect(useWishlistStore.getState().items[mockProduct.id]).toBeDefined();

    const stored = localStorage.getItem('beta-wishlist-v1');
    expect(stored).toBeTruthy();

    useWishlistStore.setState(useWishlistStore.getInitialState(), true);
    const parsed = JSON.parse(stored as string);
    useWishlistStore.setState(parsed.state);

    expect(useWishlistStore.getState().items[mockProduct.id]).toBeDefined();
  });
});
