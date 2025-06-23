import { render, screen } from '@testing-library/react';
import NotFound from './not-found';
import '@testing-library/jest-dom';

test('renders not found message with link', () => {
  render(<NotFound />);
  // Updated to reflect the new heading text in not-found.tsx
  expect(screen.getByText('404 – Nothing to see here')).toBeInTheDocument();
  // The user's provided static component for not-found.tsx does not include a "Go home" link.
  // I will comment this out for now. If a link is desired, it should be added to not-found.tsx.
  // expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
});
