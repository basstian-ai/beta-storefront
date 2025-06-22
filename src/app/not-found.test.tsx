import { render, screen } from '@testing-library/react';
import NotFound from './not-found';
import '@testing-library/jest-dom';

test('renders not found message with home link', () => {
  render(<NotFound />);
  expect(screen.getByText('404 – Not found')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: /back to home/i });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('href', '/');
});
