// tests/pages/category/[slug].integration.test.tsx
import { render, screen } from '@testing-library/react';
import CategoryPage from '@/app/category/[slug]/page';
import * as services from '@/bff/services';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';
import { vi } from 'vitest';

// Mock the services
vi.mock('@/bff/services', () => ({
  getProducts: vi.fn(),
  getCategories: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/category/smartphones',
  useSearchParams: () => new URLSearchParams(),
}));

const mockProducts: z.infer<typeof ProductSchema>[] = [
  {
    id: 1,
    title: 'iPhone 9',
    description: 'An apple mobile which is nothing like apple',
    price: 549,
    discountPercentage: 12.96,
    rating: 4.69,
    stock: 94,
    brand: 'Apple',
    category: { slug: 'smartphones', name: 'Smartphones' },
    thumbnail: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
    images: ['https://cdn.dummyjson.com/product-images/1/1.jpg'],
    slug: 'iphone-9',
    effectivePrice: { amount: 549, currencyCode: 'USD' },
  },
  {
    id: 2,
    title: 'iPhone X',
    description: 'SIM-Free, Model A19211 6.5-inch Super Retina HD display with OLED technology',
    price: 899,
    discountPercentage: 17.94,
    rating: 4.44,
    stock: 34,
    brand: 'Apple',
    category: { slug: 'smartphones', name: 'Smartphones' },
    thumbnail: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg',
    images: ['https://cdn.dummyjson.com/product-images/2/1.jpg'],
    slug: 'iphone-x',
    effectivePrice: { amount: 899, currencyCode: 'USD' },
  },
];

const mockCategories = [
  { id: 1, name: 'Smartphones', slug: 'smartphones' },
  { id: 2, name: 'Laptops', slug: 'laptops' },
];

describe('CategoryPage Integration Test', () => {
  it('should render products on the category page', async () => {
    // Arrange
    (services.getProducts as jest.Mock).mockResolvedValue({
      items: mockProducts,
      total: mockProducts.length,
    });
    (services.getCategories as jest.Mock).mockResolvedValue(mockCategories);

    const params = { slug: 'smartphones' };

    // Act
    // @ts-expect-error Server Component
    const renderResult = await CategoryPage({ params });
    render(renderResult);


    // Assert
    // Check for product titles
    expect(screen.getByText('iPhone 9')).toBeInTheDocument();
    expect(screen.getByText('iPhone X')).toBeInTheDocument();

    // Check for product prices. Note: This depends on how PriceBox formats the price.
    // Assuming it's formatted like `$XXX.XX`.
    expect(screen.getByText('$549.00')).toBeInTheDocument();
    expect(screen.getByText('$899.00')).toBeInTheDocument();

    // Check that the breadcrumb with the category name is rendered
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
  });
});
