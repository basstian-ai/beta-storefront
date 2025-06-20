import { render, screen } from '@testing-library/react';
import NotFound404 from './404';
import '@testing-library/jest-dom';

test('404 page renders without crash', () => {
  render(<NotFound404 />);
  expect(screen.getByText('Page not found')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
});
