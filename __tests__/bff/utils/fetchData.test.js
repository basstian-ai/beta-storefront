import { describe, it, expect, vi } from 'vitest';
import { fetchData } from '../../../bff/utils/fetchData.js'; // Adjusted path

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
    const data = await fetchData(url);
    expect(data).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(url);
  });

  it('throws an error when response is not ok', async () => {
    // Specific mock for this test case
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    );
    const url = 'https://dummyjson.com/notfound';
    // Make sure the path in the expected error message matches the actual path
    await expect(fetchData(url)).rejects.toThrow('HTTP error! status: 404 while fetching https://dummyjson.com/notfound');
  });
});
