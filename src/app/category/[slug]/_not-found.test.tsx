import { render, screen } from '@testing-library/react';
import CategoryNotFound from './_not-found';
import '@testing-library/jest-dom';

test('category not found renders', () => {
  render(<CategoryNotFound />);
  expect(screen.getByText('Category not found')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
});
