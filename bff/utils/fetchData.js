/**
 * Fetches data from the given URL.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} The JSON response.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchData(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Only retry on server errors (5xx) or network issues that might be transient.
        // Client errors (4xx) usually won't be resolved by retrying.
        if (response.status >= 500 || response.status === 0) { // status === 0 can indicate network error
          throw new Error(`HTTP error! status: ${response.status} while fetching ${url} (attempt ${i + 1})`);
        } else {
          // For 4xx errors, don't retry, just throw
          throw new Error(`Client error! status: ${response.status} while fetching ${url}`);
        }
      }
      return response.json();
    } catch (error) {
      console.error(`fetchData attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) { // If this was the last retry
        throw error; // Re-throw the last error
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff could be better
    }
  }
  // Should not be reached if retries > 0, but as a fallback:
  throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
}
