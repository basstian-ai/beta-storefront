import { render, screen } from '@testing-library/react';
import OrderHistory from '@/components/OrderHistory';

vi.mock('@/lib/orders', () => ({
  getOrderHistory: () => Promise.resolve([
    { id: 1, date: '2025-06-20', total: 199.99, items: 3 },
    { id: 2, date: '2025-05-11', total: 89.5, items: 1 },
  ]),
}));

it('renders rows for orders', () => {
  render(<OrderHistory />);
  const rows = screen.getAllByRole('article');
  expect(rows).toHaveLength(2);
});

