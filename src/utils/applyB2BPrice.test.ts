import { describe, it, expect } from 'vitest';
import { applyB2BPrice } from '@/utils/applyB2BPrice';

describe('applyB2BPrice', () => {
  it('applies a 10% discount for b2b role', () => {
    expect(applyB2BPrice(100, 'b2b')).toBe(90);
  });

  it('returns original price for non-b2b roles', () => {
    expect(applyB2BPrice(100, 'consumer')).toBe(100);
  });

  it('rounds the result to two decimals', () => {
    expect(applyB2BPrice(10.555, 'b2b')).toBe(9.5);
  });
});
