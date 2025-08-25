import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getOrders } from '../../bff/orders/index.js';
import * as fetchDataModule from '../../src/utils/fetchData.js';

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

describe('BFF Orders Service - getOrders', () => {
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

  it('should fetch orders (carts) and log telemetry successfully', async () => {
    const mockOrderData = { carts: [{ id: 1, userId: 1, products: [] }], total: 1, skip: 0, limit: 1 };
    fetchDataSpy.mockResolvedValue(mockOrderData);

    const result = await getOrders();

    expect(result).toEqual(mockOrderData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/carts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for orders',
      severity: 1,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'OrdersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: 1,
      },
    });

    expect(mockTrackMetric).toHaveBeenCalledTimes(1);
    expect(mockTrackMetric).toHaveBeenCalledWith({ name: 'OrdersReturned', value: 1 });

    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle data fetch failure and log telemetry accordingly', async () => {
    const mockError = new Error('Service Unavailable');
    fetchDataSpy.mockRejectedValue(mockError);

    await expect(getOrders()).rejects.toThrow('Service Unavailable');

    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/carts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for orders',
      severity: 1,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    expect(mockTrackException).toHaveBeenCalledTimes(1);
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: mockError,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockTrackMetric).not.toHaveBeenCalled();
  });

  it('should handle empty cart list successfully and not call trackMetric', async () => {
    const mockEmptyData = { carts: [], total: 0, skip: 0, limit: 0 };
    fetchDataSpy.mockResolvedValue(mockEmptyData);

    const result = await getOrders();

    expect(result).toEqual(mockEmptyData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/carts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for orders',
      severity: 1,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'OrdersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle undefined cart list successfully and not call trackMetric', async () => {
    const mockUndefinedData = { total: 0, skip: 0, limit: 0 }; // carts key is missing
    fetchDataSpy.mockResolvedValue(mockUndefinedData);

    const result = await getOrders();

    expect(result).toEqual(mockUndefinedData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/carts');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for orders',
      severity: 1,
      properties: { origin: 'bff/orders', method: 'getOrders' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'OrdersFetchSuccess',
      properties: {
        source: 'dummyjson',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });
});
