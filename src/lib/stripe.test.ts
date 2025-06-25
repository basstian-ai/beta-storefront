import { describe, it, expect, afterEach } from 'vitest';
import { validateStripeEnv } from './stripe';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('validateStripeEnv', () => {
  it('throws when required env vars are missing', () => {
    process.env = {} as any;
    expect(() => validateStripeEnv()).toThrow();
  });
});
