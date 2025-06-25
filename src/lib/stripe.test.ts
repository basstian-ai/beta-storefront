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

  it('allows missing webhook secret', () => {
    process.env = {
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
    } as any;
    expect(() => validateStripeEnv()).not.toThrow();
  });
});
