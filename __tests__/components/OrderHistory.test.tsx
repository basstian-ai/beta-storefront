import { render, screen } from '@testing-library/react';
import OrderHistory from '@/components/OrderHistory';

it('renders rows for orders', async () => {
  vi.mock('@/lib/fetchUserCarts', () => ({
    fetchUserCarts: () =>
      Promise.resolve([
        { id: 1, total: 50, totalProducts: 2, totalQuantity: 2, date: '2024-01-01' },
        { id: 2, total: 75, totalProducts: 1, totalQuantity: 1, date: '2024-02-01' },
      ]),
  }));

  render(<OrderHistory userId="5" />);
  const rows = await screen.findAllByRole('row');
  expect(rows).toHaveLength(3); // header + 2 rows
});
