import { render, screen } from '@testing-library/react';
import NotFound404 from './404';
import '@testing-library/jest-dom';

test('404 page renders without crash', () => {
  render(<NotFound404 />);
  expect(screen.getByText('404 – Not found')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: /back to home/i });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('href', '/');

});
