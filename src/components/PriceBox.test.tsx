// src/components/PriceBox.test.tsx
import { describe, it, expect } from 'vitest'; // Removed 'vi'
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers like .toHaveStyle, .toBeInTheDocument
import PriceBox from './PriceBox';
import { ProductSchema, PriceSchema } from '@/bff/types'; // Assuming types are accessible
import { z } from 'zod';

// Mock product data
const mockB2BProduct: z.infer<typeof ProductSchema> = {
  id: 1,
  title: 'B2B Product',
  description: 'A product for B2B customers',
  price: 100.00, // Original list price
  category: 'electronics',
  slug: 'b2b-product',
  stock: 10,
  effectivePrice: PriceSchema.parse({ // Parsed to ensure it matches the schema
    amount: 90.00, // Discounted B2B price
    currencyCode: 'USD',
  }),
  // Optional fields can be omitted if not needed for this test or added with dummy values
  brand: 'BrandX',
  discountPercentage: 10, // This would be the general discount, not the B2B one for this test
  images: [],
  thumbnail: '',
  rating: 4.5,
};

const mockStandardProductWithDiscount: z.infer<typeof ProductSchema> = {
  id: 2,
  title: 'Standard Product with Discount',
  description: 'A standard product with a discount',
  price: 200.00,
  category: 'clothing',
  slug: 'standard-product-discount',
  stock: 5,
  discountPercentage: 15, // Standard discount
  // No effectivePrice, so B2B logic won't apply
  brand: 'BrandY',
  images: [],
  thumbnail: '',
  rating: 4.0,
};

const mockStandardProductNoDiscount: z.infer<typeof ProductSchema> = {
  id: 3,
  title: 'Standard Product No Discount',
  description: 'A standard product without any discount',
  price: 50.00,
  category: 'home',
  slug: 'standard-product-no-discount',
  stock: 0, // Out of stock
  // No effectivePrice, no discountPercentage
  brand: 'BrandZ',
  images: [],
  thumbnail: '',
  rating: 3.5,
};


describe('PriceBox Component', () => {
  it('should display B2B price, list price (line-through), and B2B badge for B2B products', () => {
    render(<PriceBox product={mockB2BProduct} />);

    // Check for discounted B2B price (effectivePrice.amount)
    const b2bPriceElement = screen.getByText(`$${mockB2BProduct.effectivePrice!.amount.toFixed(2)}`);
    expect(b2bPriceElement).toBeInTheDocument();
    expect(b2bPriceElement).toHaveClass('text-3xl'); // Assuming main price is larger

    // Check for original list price with line-through
    const listPriceElement = screen.getByText(`$${mockB2BProduct.price.toFixed(2)}`);
    expect(listPriceElement).toBeInTheDocument();
    expect(listPriceElement).toHaveClass('line-through');

    // Check for "Your B2B Price" badge
    expect(screen.getByText('Your B2B Price')).toBeInTheDocument();

    // Check stock
    expect(screen.getByText(`${mockB2BProduct.stock} in stock`)).toBeInTheDocument();
  });

  it('should display standard discount, original price (line-through), and savings for standard products with discount', () => {
    render(<PriceBox product={mockStandardProductWithDiscount} />);

    // Main price should be original price since no effectivePrice (B2B)
    // const mainPrice = (mockStandardProductWithDiscount.price * (1 - (mockStandardProductWithDiscount.discountPercentage || 0)/100)).toFixed(2);
    // Self-correction: PriceBox currently shows original price as main price if no B2B.
    // The "Save X%" implies the discount is applied at checkout or is for informational purposes.
    // Let's test current behavior of PriceBox: it shows original price as main, then "Save X%".

    const originalPriceElement = screen.getByText(`$${mockStandardProductWithDiscount.price.toFixed(2)}`);
    expect(originalPriceElement).toBeInTheDocument();
    expect(originalPriceElement).toHaveClass('text-3xl'); // Main price

    // Check for "Save X%" text
    expect(screen.getByText(`Save ${mockStandardProductWithDiscount.discountPercentage!.toFixed(0)}%`)).toBeInTheDocument();

    // Check for original price indication if "Save %" is shown (as per PriceBox logic)
    // This tests the part: <p className="text-sm text-gray-500 line-through">Original: ${originalPrice}</p>
    expect(screen.getByText(`Original: $${mockStandardProductWithDiscount.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Original: $${mockStandardProductWithDiscount.price.toFixed(2)}`)).toHaveClass('line-through');


    // Ensure B2B badge is NOT present
    expect(screen.queryByText('Your B2B Price')).not.toBeInTheDocument();

    // Check stock
    expect(screen.getByText(`${mockStandardProductWithDiscount.stock} in stock`)).toBeInTheDocument();
  });

  it('should display only the original price for standard products without any discount', () => {
    render(<PriceBox product={mockStandardProductNoDiscount} />);

    // Main price should be the original price
    const originalPriceElement = screen.getByText(`$${mockStandardProductNoDiscount.price.toFixed(2)}`);
    expect(originalPriceElement).toBeInTheDocument();
    expect(originalPriceElement).toHaveClass('text-3xl');

    // Ensure no line-through on the main price itself if no other price is shown alongside it as primary
    expect(originalPriceElement).not.toHaveClass('line-through');


    // Ensure "Save X%" text is NOT present
    expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();

    // Ensure B2B badge is NOT present
    expect(screen.queryByText('Your B2B Price')).not.toBeInTheDocument();

    // Check stock (Out of Stock) - be specific about which element
    // Find the <p> element containing "Out of Stock"
    const stockStatusElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && content.trim() === 'Out of Stock';
    });
    expect(stockStatusElement).toBeInTheDocument();

    // Also check the button text is "Out of Stock" since it's disabled
    // For this specific test, we expect "Out of Stock" button text due to stock: 0
    // The button's accessible name changes based on stock.
    expect(screen.getByRole('button', { name: "Out of Stock" })).toBeDisabled();
  });
});
