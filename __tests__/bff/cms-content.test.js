import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCMSContent } from '@/bff/cms-content/index.js';
import * as fetchDataModule from '@/utils/fetchData';

// Mock applicationinsights
const mockTrackTrace = vi.fn();
const mockTrackEvent = vi.fn();
const mockTrackMetric = vi.fn();
const mockTrackException = vi.fn();

vi.mock('applicationinsights', () => {
  const originalModule = vi.importActual('applicationinsights');
  return {
    ...originalModule,
    default: {
      ...originalModule.default,
      defaultClient: {
        trackTrace: mockTrackTrace,
        trackEvent: mockTrackEvent,
        trackMetric: mockTrackMetric,
        trackException: mockTrackException,
      },
    },
    setup: () => ({
        setAutoCollectConsole: vi.fn().mockReturnThis(),
        setAutoCollectExceptions: vi.fn().mockReturnThis(),
        setAutoCollectPerformance: vi.fn().mockReturnThis(),
        setAutoCollectDependencies: vi.fn().mockReturnThis(),
        start: vi.fn().mockReturnThis(),
        defaultClient: {
            trackTrace: mockTrackTrace,
            trackEvent: mockTrackEvent,
            trackMetric: mockTrackMetric,
            trackException: mockTrackException,
        }
    })
  };
});

describe('BFF CMS Content Service - getCMSContent', () => {
  let fetchDataSpy;

  beforeEach(() => {
    fetchDataSpy = vi.spyOn(fetchDataModule, 'fetchData');
    mockTrackTrace.mockClear();
    mockTrackEvent.mockClear();
    mockTrackMetric.mockClear();
    mockTrackException.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch CMS posts and log telemetry successfully', async () => {
    const mockCMSData = { posts: [{ id: 1, title: 'Hello World' }], total: 1, skip: 0, limit: 1 };
    fetchDataSpy.mockResolvedValue(mockCMSData);

    const result = await getCMSContent();

    expect(result).toEqual(mockCMSData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/posts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for CMS content (posts)',
      severity: 1,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'CmsContentFetchSuccess',
      properties: {
        source: 'dummyjson',
        contentType: 'posts',
        resultCount: 1,
      },
    });

    expect(mockTrackMetric).toHaveBeenCalledTimes(1);
    expect(mockTrackMetric).toHaveBeenCalledWith({ name: 'CmsContentItemsReturned', value: 1 });

    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle data fetch failure and log telemetry accordingly', async () => {
    const mockError = new Error('Server Error');
    fetchDataSpy.mockRejectedValue(mockError);

    await expect(getCMSContent()).rejects.toThrow('Server Error');

    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/posts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for CMS content (posts)',
      severity: 1,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    expect(mockTrackException).toHaveBeenCalledTimes(1);
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: mockError,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockTrackMetric).not.toHaveBeenCalled();
  });

  it('should handle empty post list successfully and not call trackMetric', async () => {
    const mockEmptyData = { posts: [], total: 0, skip: 0, limit: 0 };
    fetchDataSpy.mockResolvedValue(mockEmptyData);

    const result = await getCMSContent();

    expect(result).toEqual(mockEmptyData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/posts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for CMS content (posts)',
      severity: 1,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'CmsContentFetchSuccess',
      properties: {
        source: 'dummyjson',
        contentType: 'posts',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle undefined post list successfully and not call trackMetric', async () => {
    const mockUndefinedData = { total: 0, skip: 0, limit: 0 }; // posts key is missing
    fetchDataSpy.mockResolvedValue(mockUndefinedData);

    const result = await getCMSContent();

    expect(result).toEqual(mockUndefinedData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/posts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for CMS content (posts)',
      severity: 1,
      properties: { origin: 'bff/cms-content', method: 'getCMSContent' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'CmsContentFetchSuccess',
      properties: {
        source: 'dummyjson',
        contentType: 'posts',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });
});
