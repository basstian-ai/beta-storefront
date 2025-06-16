// src/lib/example.test.ts
import { describe, it, expect } from 'vitest';

function add(a: number, b: number): number {
  return a + b;
}

describe('example test suite', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('add function should work correctly', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 1)).toBe(0);
  });
});
