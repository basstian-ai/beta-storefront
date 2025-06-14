import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getProducts } from '../../bff/products/index.js';
import { getProduct } from '../../bff/products/index.js';
import * as fetchDataModule from '../../bff/utils/fetchData.js';

// Mock applicationinsights
const mockTrackTrace = vi.fn();
const mockTrackEvent = vi.fn();
const mockTrackMetric = vi.fn();
const mockTrackException = vi.fn();

vi.mock('applicationinsights', () => {
  const originalModule = vi.importActual('applicationinsights');
  return {
    ...originalModule,
    default: { // Mocking the 'default' export
      ...originalModule.default,
      defaultClient: { // Mocking defaultClient on the default export
        trackTrace: mockTrackTrace,
        trackEvent: mockTrackEvent,
        trackMetric: mockTrackMetric,
        trackException: mockTrackException,
      },
    },
    setup: () => ({ // Mocking the named export 'setup'
        setAutoCollectConsole: vi.fn().mockReturnThis(),
        setAutoCollectExceptions: vi.fn().mockReturnThis(),
        setAutoCollectPerformance: vi.fn().mockReturnThis(),
        setAutoCollectDependencies: vi.fn().mockReturnThis(),
        start: vi.fn().mockReturnThis(),
        // If setup also returns a client or needs defaultClient
        defaultClient: {
            trackTrace: mockTrackTrace,
            trackEvent: mockTrackEvent,
            trackMetric: mockTrackMetric,
            trackException: mockTrackException,
        }
    })
  };
});

describe('BFF Products Service - getProducts', () => {
  let fetchDataSpy;

  beforeEach(() => {
    fetchDataSpy = vi.spyOn(fetchDataModule, 'fetchData');
    // Reset all mocks before each test
    mockTrackTrace.mockClear();
    mockTrackEvent.mockClear();
    mockTrackMetric.mockClear();
    mockTrackException.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch products and log telemetry successfully', async () => {
    const mockProductData = { products: [{ id: 1, name: 'Product 1' }], total: 1, skip: 0, limit: 1 };
    fetchDataSpy.mockResolvedValue(mockProductData);

    const result = await getProducts();

    expect(result).toEqual(mockProductData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/products');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for products',
      severity: 1,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'ProductsFetchSuccess',
      properties: {
        source: 'dummyjson',
        userType: 'anonymous',
        resultCount: 1,
      },
    });

    expect(mockTrackMetric).toHaveBeenCalledTimes(1);
    expect(mockTrackMetric).toHaveBeenCalledWith({ name: 'ProductsReturned', value: 1 });

    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle data fetch failure and log telemetry accordingly', async () => {
    const mockError = new Error('Network Error');
    fetchDataSpy.mockRejectedValue(mockError);

    await expect(getProducts()).rejects.toThrow('Network Error');

    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/products');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for products',
      severity: 1,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    expect(mockTrackException).toHaveBeenCalledTimes(1);
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: mockError,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockTrackMetric).not.toHaveBeenCalled();
  });

  it('should handle empty product list successfully and not call trackMetric', async () => {
    const mockEmptyData = { products: [], total: 0, skip: 0, limit: 0 };
    fetchDataSpy.mockResolvedValue(mockEmptyData);

    const result = await getProducts();

    expect(result).toEqual(mockEmptyData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/products');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for products',
      severity: 1,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'ProductsFetchSuccess',
      properties: {
        source: 'dummyjson',
        userType: 'anonymous',
        resultCount: 0,
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });

  it('should handle undefined product list successfully and not call trackMetric', async () => {
    const mockUndefinedData = { total: 0, skip: 0, limit: 0 }; // products key is missing
    fetchDataSpy.mockResolvedValue(mockUndefinedData);

    const result = await getProducts();

    expect(result).toEqual(mockUndefinedData);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/products');

    expect(mockTrackTrace).toHaveBeenCalledTimes(1);
    expect(mockTrackTrace).toHaveBeenCalledWith({
      message: 'Calling dummyjson for products',
      severity: 1,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'ProductsFetchSuccess',
      properties: {
        source: 'dummyjson',
        userType: 'anonymous',
        resultCount: 0, // products?.length ?? 0 will be 0
      },
    });

    expect(mockTrackMetric).not.toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });
});

describe('BFF Products Service - getProduct', () => {
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

  it('fetches a single product and logs telemetry', async () => {
    const mockProduct = { id: 1, title: 'Phone' };
    fetchDataSpy.mockResolvedValue(mockProduct);

    const result = await getProduct(1);

    expect(result).toEqual(mockProduct);
    expect(fetchDataSpy).toHaveBeenCalledWith('https://dummyjson.com/products/1');
    expect(mockTrackTrace).toHaveBeenCalled();
    expect(mockTrackEvent).toHaveBeenCalled();
    expect(mockTrackException).not.toHaveBeenCalled();
  });
});
