/**
 * Fetches data from the given URL.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} The JSON response.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchData(url) {
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} while fetching ${url}`);
  }
  return response.json();
}
