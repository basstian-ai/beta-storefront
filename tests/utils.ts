/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, type RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import React, { type ReactElement } from 'react';
import { vi } from 'vitest';

export const flushSpy = vi.fn();

vi.mock('use-debounce', () => ({
  useDebouncedCallback: <T extends unknown[]>(fn: (...args: T) => void) => {
    const wrapped = (...args: T) => fn(...args);
    (wrapped as any).flush = flushSpy;
    (wrapped as any).cancel = vi.fn();
    return wrapped as typeof wrapped & { flush: typeof flushSpy; cancel: () => void };
  },
}));

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
);

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}
