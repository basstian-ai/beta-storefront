import { mergeQueryString } from './mergeQuery';
import { describe, it, expect } from 'vitest';

describe('mergeQueryString', () => {
  it('preserves existing keys when adding new ones', () => {
    const result = mergeQueryString('q=laptop&skip=40&limit=20', { sort: 'price-asc' });
    expect(result).toBe('q=laptop&skip=40&limit=20&sort=price-asc');
  });
});
