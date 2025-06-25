import { render, screen } from '@testing-library/react';
import OrderHistory from '@/components/OrderHistory';

it('renders placeholder message when no orders', async () => {
  vi.mock('@/lib/orders', () => ({
    getOrderHistory: () => Promise.resolve([]),
  }));
  render(<OrderHistory />);
  expect(await screen.findByText(/haven’t placed any orders/i)).toBeInTheDocument();
});
