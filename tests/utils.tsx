/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, type RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import React, { type ReactElement } from 'react';
import { vi } from 'vitest';

export const flushSpy = vi.fn();

import { SearchStatusProvider } from '@/context/SearchStatusContext';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={null}>
    <SearchStatusProvider>{children}</SearchStatusProvider>
  </SessionProvider>
);

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}
