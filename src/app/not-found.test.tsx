import { render, screen } from '@testing-library/react';
import NotFound from './not-found';
import '@testing-library/jest-dom';

vi.mock('@/components/SearchBar', () => ({
  default: () => <input placeholder="Search products…" />,
}));

test('renders not found message with search input', () => {
  render(<NotFound />);
  expect(screen.getByText('Page not found')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search products…')).toBeInTheDocument();
});
