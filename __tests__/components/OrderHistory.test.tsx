import { render, screen } from '@testing-library/react';
import OrderHistoryClient from '@/components/OrderHistoryClient';

global.fetch = vi.fn();

it('renders rows for orders', async () => {
  (fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => [
      { id: 1, total: 50, createdAt: '2024-01-01T00:00:00Z' },
      { id: 2, total: 75, createdAt: '2024-02-01T00:00:00Z' },
    ],
  });

  render(<OrderHistoryClient userId="1" />);
  const rows = await screen.findAllByRole('row');
  expect(rows).toHaveLength(3); // header + 2 rows
});

