import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderHistory from '@/components/OrderHistory';
import '@testing-library/jest-dom';

const mockCarts = [
  { id: 1, total: 10, totalProducts: 1, totalQuantity: 2 },
  { id: 2, total: 20, totalProducts: 2, totalQuantity: 3 },
];

describe('OrderHistory', () => {
  it('renders a row for each cart', () => {
    render(<OrderHistory carts={mockCarts} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(mockCarts.length + 1); // header + carts
  });
});
