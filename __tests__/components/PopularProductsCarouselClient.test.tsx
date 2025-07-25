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
  blurDataURL: 'data:image/png;base64,AAA',
}));

describe('PopularProductsCarouselClient', () => {
  it('renders five product links', () => {
    render(<PopularProductsCarouselClient products={mockProducts} />);
    mockProducts.forEach(p => {
      const link = screen.getByRole('link', { name: p.title });
      expect(link).toHaveAttribute(
        'href',
        `/product/${p.title.toLowerCase().replace(/\s+/g, '-')}`
      );
    });
    const titleLinks = screen.getAllByRole('link', { name: /Product/ });
    expect(titleLinks).toHaveLength(5);
  });

  it('disables arrows when products do not exceed visible cards', () => {
    const few = mockProducts.slice(0, 3);
    render(<PopularProductsCarouselClient products={few} />);
    expect(
      screen.getByRole('button', { name: /previous products/i })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('button', { name: /next products/i })
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
