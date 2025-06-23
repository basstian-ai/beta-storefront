// src/bff/adapters/dummyjson.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'; // Removed afterEach
import { login, AdapterLoginResponseSchema } from './dummyjson'; // Assuming AdapterLoginResponseSchema is exported
// import { z } from 'zod'; // Removed z as it's not directly used in this test file's assertions

// Mock the global fetch function
global.fetch = vi.fn();

describe('dummyJsonAdapter.login', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockCredentials = { username: 'testuser', password: 'password123' };
  const mockApiResponse = {
    id: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    gender: 'male', // Ensure this matches enum in schema
    image: 'https://example.com/avatar.png',
    token: 'fake-jwt-token',
  };

  it('should call fetch with correct URL, method, headers, and body', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await login(mockCredentials);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: mockCredentials.username,
        password: mockCredentials.password,
      }),
    });
  });

  it('should return an object with token, accessToken, and user details on successful login', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await login(mockCredentials);

    expect(result).toBeDefined();
    expect(result.id).toBe(mockApiResponse.id);
    expect(result.username).toBe(mockApiResponse.username);
    expect(result.token).toBe(mockApiResponse.token);
    expect(result.accessToken).toBe(mockApiResponse.token); // accessToken should be alias of token

    // Validate against the exported schema if possible
    expect(() => AdapterLoginResponseSchema.parse(result)).not.toThrow();
  });

  it('should throw an error if login request fails (response not ok)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid credentials' }), // Simulate error response body
    } as Response);

    await expect(login(mockCredentials)).rejects.toThrow('Login failed: Invalid credentials');
  });

  it('should throw an error if login request fails (network error or other non-JSON response)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error("Cannot parse JSON") },
    } as Response);

    await expect(login(mockCredentials)).rejects.toThrow('Login failed: Internal Server Error');
  });

  it('should throw a Zod validation error if API response has unexpected structure', async () => {
    const malformedApiResponse = { ...mockApiResponse, token: undefined }; // Missing token
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => malformedApiResponse,
    } as Response);

    await expect(login(mockCredentials)).rejects.toThrow('Login response validation failed.');
  });

  it('should throw an error if username is missing', async () => {
    await expect(login({ password: 'password123' })).rejects.toThrow('Username and password are required.');
  });

  it('should throw an error if password is missing', async () => {
    await expect(login({ username: 'testuser' })).rejects.toThrow('Username and password are required.');
  });
});
