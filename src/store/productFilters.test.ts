import { describe, it, expect, beforeEach } from 'vitest';
import { useProductFilters } from './productFilters';

beforeEach(() => {
  useProductFilters.setState(useProductFilters.getInitialState(), true);
});

describe('productFilters store', () => {
  it('initializes with defaults', () => {
    const state = useProductFilters.getState();
    expect(state.sort).toBe('relevance');
    expect(state.brands).toEqual([]);
  });

  it('can update sort', () => {
    useProductFilters.getState().setSort('price_desc');
    expect(useProductFilters.getState().sort).toBe('price_desc');
  });

  it('toggles brands', () => {
    const store = useProductFilters.getState();
    store.toggleBrand('Apple');
    expect(useProductFilters.getState().brands).toEqual(['Apple']);
    store.toggleBrand('Apple');
    expect(useProductFilters.getState().brands).toEqual([]);
  });

  it('initializes from query params', () => {
    const params = new URLSearchParams('sort=price_desc&min=10&max=20&brand=A&brand=B&rating=4');
    useProductFilters.getState().initializeFromQuery(params);
    const state = useProductFilters.getState();
    expect(state.sort).toBe('price_desc');
    expect(state.min).toBe(10);
    expect(state.max).toBe(20);
    expect(state.brands).toEqual(['A','B']);
    expect(state.rating).toBe(4);
  });
});

