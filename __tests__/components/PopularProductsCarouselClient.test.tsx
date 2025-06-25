import React from 'react';
import { render, screen } from '@testing-library/react';
import PopularProductsCarouselClient from '@/components/PopularProductsCarouselClient';
import type { PopularProduct } from '@/utils/getPopularProducts';

const mockProducts: PopularProduct[] = Array.from({ length: 5 }).map((_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  price: 10 * (i + 1),
  discountPercentage: 0,
  thumbnail: `https://example.com/p${i + 1}.jpg`,
  rating: 5 - i * 0.2,
}));

describe('PopularProductsCarouselClient', () => {
  it('renders five product links', () => {
    render(<PopularProductsCarouselClient products={mockProducts} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    mockProducts.forEach(p => {
      expect(screen.getByRole('link', { name: p.title })).toHaveAttribute(
        'href',
        `/product/${p.id}`
      );
    });
  });
});
