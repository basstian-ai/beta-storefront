import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getUsers } from '@/bff/users/index.js';
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

describe('BFF Users Service - getUsers', () => {
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

  it('should fetch users and log telemetry successfully', async () => {
    const mockUserData = { users: [{ id: 1, firstName: 'Terry' }], total: 1, skip: 0, limit: 1 };
    fetchDataSpy.mockResolvedValue(mockUserData);

    const result = await getUsers();

    expect(result).toEqual(mockUserData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/users');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for users',
      severity: 1,
      properties: { origin: 'bff/users', method: 'getUsers' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'UsersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: 1,
      },
    });

    expect(mockTrackMetric).toHaveBeenCalledTimes(1);
    expect(mockTrackMetric).toHaveBeenCalledWith({ name: 'UsersReturned', value: 1 });

    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle data fetch failure and log telemetry accordingly', async () => {
    const mockError = new Error('API Error');
    fetchDataSpy.mockRejectedValue(mockError);

    await expect(getUsers()).rejects.toThrow('API Error');

    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/users');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for users',
      severity: 1,
      properties: { origin: 'bff/users', method: 'getUsers' },
    });

    expect(mockTrackException).toHaveBeenCalledTimes(1);
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: mockError,
      properties: { origin: 'bff/users', method: 'getUsers' },
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockTrackMetric).not.toHaveBeenCalled();
  });

  it('should handle empty user list successfully and not call trackMetric', async () => {
    const mockEmptyData = { users: [], total: 0, skip: 0, limit: 0 };
    fetchDataSpy.mockResolvedValue(mockEmptyData);

    const result = await getUsers();

    expect(result).toEqual(mockEmptyData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/users');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    // trackTrace assertion ...

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'UsersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle undefined user list successfully and not call trackMetric', async () => {
    const mockUndefinedData = { total: 0, skip: 0, limit: 0 }; // users key is missing
    fetchDataSpy.mockResolvedValue(mockUndefinedData);

    const result = await getUsers();

    expect(result).toEqual(mockUndefinedData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/users');

    // trackTrace assertion ...

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'UsersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });
});
