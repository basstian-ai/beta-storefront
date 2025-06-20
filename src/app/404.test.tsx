import { render, screen } from '@testing-library/react';
import NotFound404 from './404';
import '@testing-library/jest-dom';

vi.mock('@/components/SearchBar', () => ({
  default: () => <input placeholder="Search products…" />,
}));

test('404 page renders without crash', () => {
  render(<NotFound404 />);
  expect(screen.getByText('Page not found')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search products…')).toBeInTheDocument();
});
