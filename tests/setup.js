import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest'; // For additional matchers

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);
