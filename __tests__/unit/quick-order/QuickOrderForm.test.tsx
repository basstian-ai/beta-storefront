import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickOrderForm from '@/app/(protected)/quick-order/QuickOrderForm';
import { vi, Mock } from 'vitest';
import { useCartStore } from '@/stores/useCartStore';

vi.mock('@/bff/services', () => ({ getProductByIdOrSlug: vi.fn() }));
import { getProductByIdOrSlug } from '@/bff/services';
const mockedGetProduct = getProductByIdOrSlug as Mock;

describe('QuickOrderForm add logic', () => {
  beforeEach(() => {
    mockedGetProduct.mockReset();
    useCartStore.setState(useCartStore.getInitialState(), true);
  });

  it('adds a new row when clicking Add Row', () => {
    render(<QuickOrderForm />);
    expect(screen.getAllByLabelText(/sku/i)).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    expect(screen.getAllByLabelText(/sku/i)).toHaveLength(4);
  });

  it('shows error when SKU is missing', async () => {
    render(<QuickOrderForm />);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() => {
      expect(screen.getAllByText('SKU required').length).toBeGreaterThan(0);
    });
    expect(useCartStore.getState().getTotalItems()).toBe(0);
  });

  it('shows error when quantity is not positive', async () => {
    render(<QuickOrderForm />);
    const skuInput = screen.getAllByLabelText(/sku/i)[0];
    const qtyInput = screen.getAllByLabelText(/quantity/i)[0];
    fireEvent.change(skuInput, { target: { value: '1' } });
    fireEvent.change(qtyInput, { target: { value: '0' } });
    const form = screen.getByRole('button', { name: /add to cart/i }).closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText('Quantity must be > 0')).toBeInTheDocument();
    expect(useCartStore.getState().getTotalItems()).toBe(0);
  });

  it('adds valid SKU to cart', async () => {
    mockedGetProduct.mockResolvedValue({
      id: 1,
      title: 'P1',
      slug: 'p1',
      description: 'd',
      price: 5,
      category: { id: 1, name: 'c', slug: 'c' },
    });
    render(<QuickOrderForm />);
    const skuInput = screen.getAllByLabelText(/sku/i)[0];
    const qtyInput = screen.getAllByLabelText(/quantity/i)[0];
    fireEvent.change(skuInput, { target: { value: '1' } });
    fireEvent.change(qtyInput, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() => {
      expect(useCartStore.getState().getTotalItems()).toBe(2);
    });
    expect(mockedGetProduct).toHaveBeenCalledWith('1');
  });
});
