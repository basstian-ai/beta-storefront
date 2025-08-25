import { fetchData } from '../../src/utils/fetchData.js';
import appInsights from 'applicationinsights';

/**
 * Fetches CMS content (posts) from dummyjson.com.
 * @returns {Promise<Object>} A promise that resolves to the CMS content.
 */
export async function getCMSContent() {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for CMS content (posts)',
      severity: 1, // Info
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    // Assuming a dummy endpoint for CMS content, using posts as an example
    const data = await fetchData('https://dummyjson.com/posts');

    client.trackEvent({
      name: 'CmsContentFetchSuccess',
      properties: {
        source: 'dummyjson',
        contentType: 'posts', // Example content type
        resultCount: data?.posts?.length ?? 0,
      },
    });

    if (data?.posts?.length) {
      client.trackMetric({
        name: 'CmsContentItemsReturned',
        value: data.posts.length,
      });
    }

    return data;
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
