import { describe, it, expect, vi } from 'vitest';
import { fetchData } from './fetchData';

// global.fetch is already mocked in tests/setup.js,
// but individual tests might want to override it.

describe('fetchData utility', () => {
  // Reset the mock before each test if specific behavior is needed per test
  beforeEach(() => {
    // Reset to a generic successful mock, or specific mocks can be set in each 'it' block
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it('fetches data successfully from a URL', async () => {
    const url = 'https://dummyjson.com/test';
    const { data, error } = await fetchData<{ success: boolean }>(url);
    expect(error).toBeUndefined();
    expect(data).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(url, { next: { revalidate: 60 } });
  });

  it('returns an error when response is not ok', async () => {
    // Specific mock for this test case
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found'),
      })
    );
    const url = 'https://dummyjson.com/notfound';
    const { data, error } = await fetchData(url);
    expect(data).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('404: Not found');
  });
});
