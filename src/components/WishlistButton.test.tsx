// src/components/WishlistButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import WishlistButton from './WishlistButton';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { ADD_TO_WISHLIST, SAVED_TO_WISHLIST } from '@/constants/text';

const mockProduct: z.infer<typeof ProductSchema> = {
  id: 1,
  title: 'Test',
  price: 5,
  description: 'd',
  category: { name: 'Cat', slug: 'cat' },
  slug: 'test',
  images: [],
  thumbnail: '',
  rating: 4,
};

beforeEach(() => {
  useWishlistStore.setState(useWishlistStore.getInitialState(), true);
});

describe('WishlistButton', () => {
  it('toggles label and icon', () => {
    render(<WishlistButton product={mockProduct} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent(ADD_TO_WISHLIST);
    const svg = btn.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');

    fireEvent.click(btn);
    expect(btn).toHaveTextContent(SAVED_TO_WISHLIST);
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });
});
