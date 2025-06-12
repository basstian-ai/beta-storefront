import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedProductsCarousel from '@/components/FeaturedProductsCarousel';
import type { Product } from '@/types'; // Assuming Product type is in @/types

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    slug: 'product-1',
    createdAt: '2023-09-10T00:00:00Z',
    price: 10.99,
    imageUrl: 'https://via.placeholder.com/150/product1.png',
  },
  {
    id: '2',
    name: 'Product 2',
    slug: 'product-2',
    createdAt: '2023-09-11T00:00:00Z',
    price: 25.50,
    imageUrl: 'https://via.placeholder.com/150/product2.png',
  },
  {
    id: '3',
    name: 'Product 3',
    slug: 'product-3-special',
    createdAt: '2023-09-12T00:00:00Z',
    price: 5.00,
    imageUrl: 'https://via.placeholder.com/150/product3.png',
  },
];

describe('FeaturedProductsCarousel', () => {
  it('renders correctly with given products', () => {
    render(<FeaturedProductsCarousel products={mockProducts} />);

    // Check for the section title
    expect(screen.getByRole('heading', { name: /Featured Products/i })).toBeInTheDocument();

    // Check each product card
    mockProducts.forEach(product => {
      // Check product name
      expect(screen.getByText(product.name)).toBeInTheDocument();

      // Check product price (formatted)
      // Note: If using Intl.NumberFormat or similar, the exact string might vary.
      // Here, we rely on toFixed(2) as used in the component.
      expect(screen.getByText(`$${product.price.toFixed(2)}`)).toBeInTheDocument();

      // Check product link
      const linkElement = screen.getByRole('link', { name: new RegExp(product.name, 'i') });
      expect(linkElement).toHaveAttribute('href', `/products/${product.slug}`);

      // Check product image
      const imageElement = screen.getByAltText(product.name);
      expect(imageElement).toBeInTheDocument();
      expect(imageElement).toHaveAttribute('src', product.imageUrl);
    });
  });

  it('renders nothing if products array is empty', () => {
    // The component itself doesn't conditionally render its root based on empty products.
    // It renders the section title and an empty carousel div.
    // The conditional rendering is expected to be handled by the parent component (e.g., HomePage).
    // So, we test that the title is still there but no product cards are.
    render(<FeaturedProductsCarousel products={[]} />);

    expect(screen.getByRole('heading', { name: /Featured Products/i })).toBeInTheDocument();

    // Check that no product names are present (as a proxy for no product cards)
    mockProducts.forEach(product => {
      expect(screen.queryByText(product.name)).not.toBeInTheDocument();
    });
  });

  it('renders the carousel structure', () => {
    render(<FeaturedProductsCarousel products={mockProducts} />);
    const carouselDiv = screen.getByRole('heading', { name: /Featured Products/i }).nextElementSibling;
    expect(carouselDiv).toHaveClass('carousel');
  });
});
