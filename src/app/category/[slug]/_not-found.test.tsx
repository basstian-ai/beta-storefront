import { render, screen } from '@testing-library/react';
import CategoryNotFound from './_not-found';
import '@testing-library/jest-dom';

vi.mock('@/components/SearchBar', () => ({
  default: () => <input placeholder="Search products…" />,
}));

test('category not found renders', () => {
  render(<CategoryNotFound />);
  expect(screen.getByText('Category not found')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search products…')).toBeInTheDocument();
});
