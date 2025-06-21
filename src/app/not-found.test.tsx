import { render, screen } from '@testing-library/react';
import NotFound from './not-found';
import '@testing-library/jest-dom';

test('renders not found message with link', () => {
  render(<NotFound />);
  expect(screen.getByText('Page not found')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
});
