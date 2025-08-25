import { cmsAdapter } from '@/adapters/cms';
import appInsights from 'applicationinsights';
import { z } from 'zod';
import { CMSContentResponseSchema } from '../types';

export type CMSContentResponse = z.infer<typeof CMSContentResponseSchema>;

/**
 * Fetches CMS content (posts) from dummyjson.com.
 * @returns A promise that resolves to the CMS content.
 */
export async function getCMSContent(): Promise<CMSContentResponse> {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for CMS content (posts)',
      severity: 1, // Info
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    // Assuming a dummy endpoint for CMS content, using posts as an example
    const data = await cmsAdapter.getContent();
    const parsed = CMSContentResponseSchema.parse(data);

    client.trackEvent({
      name: 'CmsContentFetchSuccess',
      properties: {
        source: 'dummyjson',
        contentType: 'posts', // Example content type
        resultCount: parsed.posts.length,
      },
    });

    if (parsed.posts.length) {
      client.trackMetric({
        name: 'CmsContentItemsReturned',
        value: parsed.posts.length,
      });
    }

    return parsed;
  } catch (error) {
    client.trackException({
      exception: error as Error,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
