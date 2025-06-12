// __tests__/components/ProductList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers like .toBeInTheDocument()
import ProductList from '@/components/ProductList';
import { Product } from '@/lib/api'; // Using the same Product type

// Mock next/image and next/link as they are often problematic in Jest/RTL environment without specific setup
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    createdAt: '2023-09-01T00:00:00Z',
    price: 1299.99,
    brand: 'TechCorp',
    size: '15-inch',
    imageUrl: '/images/laptop.jpg',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    createdAt: '2023-09-02T00:00:00Z',
    price: 49.50,
    brand: 'ClickMaster',
    size: 'Standard',
    imageUrl: '/images/mouse.jpg',
  },
];

describe('ProductList Component', () => {
  it('renders the empty state message when no products are provided', () => {
    render(<ProductList products={[]} />);
    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('renders a list of products correctly', () => {
    render(<ProductList products={mockProducts} />);

    // Check if product names are rendered
    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();

    // Check if product prices are rendered (formatted)
    expect(screen.getByText('$1299.99')).toBeInTheDocument();
    expect(screen.getByText('$49.50')).toBeInTheDocument();

    // Check if brand and size are rendered
    expect(screen.getByText('Brand: TechCorp')).toBeInTheDocument();
    expect(screen.getByText('Size: 15-inch')).toBeInTheDocument();
    expect(screen.getByText('Brand: ClickMaster')).toBeInTheDocument();
    expect(screen.getByText('Size: Standard')).toBeInTheDocument();
  });

  it('renders product images', () => {
    render(<ProductList products={mockProducts} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(mockProducts.length);
    expect(images[0]).toHaveAttribute('src', '/images/laptop.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Laptop Pro');
    expect(images[1]).toHaveAttribute('src', '/images/mouse.jpg');
    expect(images[1]).toHaveAttribute('alt', 'Wireless Mouse');
  });

  it('renders links for each product', () => {
    render(<ProductList products={mockProducts} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(mockProducts.length);
    expect(links[0]).toHaveAttribute('href', '/product/1');
    expect(links[1]).toHaveAttribute('href', '/product/2');
  });

  it('handles products with missing imageUrl by using placeholder', () => {
    const productsWithMissingImage: Product[] = [
      {
        id: '3',
        name: 'Keyboard Basic',
        createdAt: '2023-09-03T00:00:00Z',
        price: 29.99,
        brand: 'TypeEasy',
        size: 'Full',
        imageUrl: '', // Empty imageUrl
      },
    ];
    render(<ProductList products={productsWithMissingImage} />);
    const image = screen.getByRole('img') as HTMLImageElement;
    expect(image.src).toContain('/placeholder-image.png'); // Check if src contains the placeholder path
    expect(image.alt).toBe('Keyboard Basic');
  });
});
