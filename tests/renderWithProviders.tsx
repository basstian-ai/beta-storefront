import { render, type RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import React, { type ReactElement } from 'react';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}
