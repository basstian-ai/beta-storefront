// src/bff/httpClient.ts

interface HttpClientOptions extends RequestInit {
  // We can add custom options here later if needed, e.g., specific error handling, retries.
  // For now, it directly maps to RequestInit.
}

// Default base URL for the DummyJSON API
// DUMMYJSON_API_BASE is not currently in .env.example, but this makes it configurable if added.
const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.DUMMYJSON_API_BASE ||
  'https://dummyjson.com';

/**
 * A simple HTTP client wrapper around fetch.
 * - Prepends a base URL.
 * - Merges default headers (Content-Type, Accept for JSON).
 * - Returns the raw Response object, allowing callers to handle parsing and errors.
 *
 * @param endpoint The API endpoint (e.g., '/auth/login', '/products').
 * @param options Fetch options (method, body, custom headers, etc.).
 * @param baseUrl Optional base URL to override the default.
 * @returns A Promise resolving to the Fetch API's Response object.
 */
export async function httpClient(
  endpoint: string,
  options: HttpClientOptions = {},
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<Response> {
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add any other common default headers here, e.g., User-Agent if it becomes static
  };

  const mergedOptions: RequestInit = {
    ...options, // User-provided options come first
    headers: {
      ...defaultHeaders, // Default headers
      ...options.headers, // User-provided headers override defaults
    },
  };

  // In a real scenario, you might want to log the outgoing request here using a proper logger
  // For example, using the 'debug' library if this httpClient is used broadly.
  // log(`httpClient: Sending ${mergedOptions.method || 'GET'} request to ${url}`);

  return fetch(url, mergedOptions);
}

// Example of a more specific error class if httpClient were to handle errors:
// export class HTTPError extends Error {
//   status: number;
//   response: Response;
//   data?: any; // Parsed error data if available
//
//   constructor(response: Response, message?: string, data?: any) {
//     super(message || `HTTP Error: ${response.status} ${response.statusText}`);
//     this.name = 'HTTPError';
//     this.status = response.status;
//     this.response = response;
//     this.data = data;
//   }
// }
