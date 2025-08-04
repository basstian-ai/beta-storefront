import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickOrderForm from './QuickOrderForm';
import '@testing-library/jest-dom';
import { vi, Mock } from 'vitest';
import { useCartStore } from '@/stores/useCartStore';

vi.mock('@/bff/services', () => ({
  getProductByIdOrSlug: vi.fn(),
}));

import { getProductByIdOrSlug } from '@/bff/services';
const mockedGetProduct = getProductByIdOrSlug as Mock;

describe('QuickOrderForm', () => {
  beforeEach(() => {
    mockedGetProduct.mockReset();
    useCartStore.setState(useCartStore.getInitialState(), true);
  });

  test('renders at least three SKU rows', () => {
    render(<QuickOrderForm />);
    const skuInputs = screen.getAllByLabelText(/sku/i);
    expect(skuInputs.length).toBeGreaterThanOrEqual(3);
  });

  test('adds multiple valid SKUs to cart and updates totals', async () => {
    mockedGetProduct.mockImplementation(async (idOrSlug: string) => ({
      id: Number(idOrSlug),
      title: `Product ${idOrSlug}`,
      slug: `p-${idOrSlug}`,
      description: 'desc',
      price: 5,
      category: { id: 1, name: 'cat', slug: 'cat' },
    }));

    render(<QuickOrderForm />);
    const skuInputs = screen.getAllByLabelText(/sku/i);
    const qtyInputs = screen.getAllByLabelText(/quantity/i);

    fireEvent.change(skuInputs[0], { target: { value: '1' } });
    fireEvent.change(qtyInputs[0], { target: { value: '1' } });
    fireEvent.change(skuInputs[1], { target: { value: '2' } });
    fireEvent.change(qtyInputs[1], { target: { value: '2' } });
    fireEvent.change(skuInputs[2], { target: { value: '3' } });
    fireEvent.change(qtyInputs[2], { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(useCartStore.getState().getTotalItems()).toBe(6);
    });
    expect(useCartStore.getState().getCartSubtotal()).toBe(30);
  });

  test('shows error for invalid SKU', async () => {
    mockedGetProduct.mockRejectedValueOnce(new Error('not found'));
    render(<QuickOrderForm />);
    const skuInputs = screen.getAllByLabelText(/sku/i);
    const qtyInputs = screen.getAllByLabelText(/quantity/i);

    fireEvent.change(skuInputs[0], { target: { value: 'bad' } });
    fireEvent.change(qtyInputs[0], { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid SKU')).toBeInTheDocument();
    });
    expect(useCartStore.getState().getTotalItems()).toBe(0);
  });
});
