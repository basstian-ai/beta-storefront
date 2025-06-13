import { fetchData } from '../utils/fetchData.js';
import appInsights from 'applicationinsights';

/**
 * Transforms raw product data from dummyjson into our {@link Product} shape.
 *
 * @param {Record<string, any>} product - Raw product object from the API.
 * @param {number} [index=-1] - Index of the product in the list (used for demo variants).
 * @returns {import('../../types').Product | null} Processed product or `null` when input is invalid.
 */

export function processProduct(product, index = -1) { // Added index default
  if (!product || typeof product !== 'object') { // Basic guard
    console.warn('processProduct received invalid product data:', product);
    return null; // Or throw error
  }

  // Ensure product.price is a number, default to 0 if not (or handle as error)
  // Product price from dummyjson is number, this is just a safeguard for general use.
  const basePrice = typeof product.price === 'number' ? product.price : 0;

  const baseProduct = {
    ...product, // Spread first to include all original fields like id, title, description, etc.
    // Ensure images are correctly processed: use existing images array, fallback to thumbnail, or empty array
    images: product.images && Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : (product.thumbnail ? [product.thumbnail] : []),
    specifications: product.specifications || { general: "Basic " + (product.title || 'product') + " specifications." },
    // Initialize priceTiers, will be populated or overridden by index-specific logic or API data
    priceTiers: [],
    // Ensure contractPrice is null if undefined from source, otherwise use provided value
    // This was previously: index === 0 ? product.price * 0.8 : (product.contractPrice || null)
    // We'll let index-specific logic override this default.
    contractPrice: product.contractPrice !== undefined ? product.contractPrice : null,
  };

  // Handle priceTiers from product data if available (and not overridden by index-specific logic later)
  if (product.priceTiers && Array.isArray(product.priceTiers)) {
     baseProduct.priceTiers = product.priceTiers.map(pt => ({
        quantity: typeof pt.quantity === 'number' ? pt.quantity : 0,
        price: typeof pt.price === 'number' ? pt.price : 0,
        label: typeof pt.label === 'string' ? pt.label : undefined
      })).filter(pt => pt.quantity > 0 && pt.price > 0);
  } else {
      baseProduct.priceTiers = []; // Ensure it's an empty array if not provided
  }


  // Index-specific mocking (variants, specific contract prices/tiers)
  if (index >= 0) { // Apply index-specific logic only if index is valid
    if (index === 0) {
      baseProduct.contractPrice = basePrice * 0.8; // 20% discount for product 0
      // Overwrite or extend existing priceTiers for product 0
      baseProduct.priceTiers = [
        { quantity: 5, price: basePrice * 0.9, label: 'each' },
        { quantity: 10, price: basePrice * 0.85, label: 'each' }
      ];
      baseProduct.variants = [
        {
          id: `${product.id}-variant1`,
          name: "Red Color",
          description: product.description, // Variants inherit base description unless specified
          images: ["https://dummyjson.com/image/i/products/1/1.jpg", "https://dummyjson.com/image/i/products/1/2.jpg"],
          price: basePrice + 10,
          specifications: { ...baseProduct.specifications, color: "Red", material: "Premium" },
          contractPrice: (basePrice + 10) * 0.75,
          priceTiers: [ { quantity: 2, price: (basePrice + 10) * 0.95, label: 'unit' } ],
        },
        {
          id: `${product.id}-variant2`,
          name: "Blue Color",
          description: product.description,
          images: ["https://dummyjson.com/image/i/products/1/3.jpg", "https://dummyjson.com/image/i/products/1/4.jpg"],
          price: basePrice + 15,
          specifications: { ...baseProduct.specifications, color: "Blue", material: "Standard" },
          // This variant inherits contract price from base product (which is (basePrice * 0.8) for index 0)
        },
      ];
    } else if (index === 1) {
      baseProduct.contractPrice = basePrice * 0.85; // 15% discount for product 1
      baseProduct.variants = [
        {
          id: `${product.id}-variant-large`,
          name: "Large Size",
          description: product.description,
          price: basePrice * 1.2,
          specifications: { ...baseProduct.specifications, size: "Large" },
          contractPrice: (basePrice * 1.2) * 0.8,
        },
      ];
    }
  }

  // Fallback for variants if not mocked by index but present in product data
  // This ensures that if API provides variants for products other than index 0 or 1, they are included
  if (!baseProduct.variants && product.variants && Array.isArray(product.variants)) {
    baseProduct.variants = product.variants.map(v => ({ // Ensure variants conform
        id: String(v.id || product.id + '-variant-' + Math.random().toString(36).substr(2, 9)), // Ensure ID is string and unique
        name: v.name || 'Variant',
        description: v.description || baseProduct.description,
        images: v.images && Array.isArray(v.images) && v.images.length > 0 ? v.images : baseProduct.images,
        price: typeof v.price === 'number' ? v.price : basePrice, // Fallback to base product's price
        specifications: v.specifications || baseProduct.specifications,
        priceTiers: v.priceTiers && Array.isArray(v.priceTiers) ? v.priceTiers.map(pt => ({
            quantity: typeof pt.quantity === 'number' ? pt.quantity : 0,
            price: typeof pt.price === 'number' ? pt.price : 0,
            label: typeof pt.label === 'string' ? pt.label : undefined
          })).filter(pt => pt.quantity > 0 && pt.price > 0) : [],
        contractPrice: typeof v.contractPrice === 'number' ? v.contractPrice : undefined, // Variant contract price
    }));
  } else if (!baseProduct.variants) {
      baseProduct.variants = []; // Ensure variants array exists
  }


  return baseProduct;
}

export async function getProducts() {
  // Safely get the client
  const client = appInsights && appInsights.defaultClient ? appInsights.defaultClient : null;

  try {
    if (client) {
      client.trackTrace({
        message: 'Calling dummyjson for products',
        severity: 1, // Info
        properties: { origin: 'bff/products', method: 'getProducts' },
      });
    }

    const rawData = await fetchData('https://dummyjson.com/products?limit=100');

    if (typeof rawData !== 'object' || rawData === null || !Array.isArray(rawData.products)) {
      const errorMsg = 'Invalid data structure received from product API: products array not found or not an array.';
      console.error(errorMsg, 'Raw data:', rawData);
      if (client) {
        client.trackException({
          exception: new Error(errorMsg),
          properties: { origin: 'bff/products', method: 'getProducts', rawDataReceived: JSON.stringify(rawData, null, 2).substring(0, 1000) }
        });
      }
      throw new Error(errorMsg);
    }


    const processedProducts = rawData.products.map((p, idx) => processProduct(p, idx)).filter(p => p !== null);

    const data = { ...rawData, products: processedProducts };

    if (client) {
      client.trackEvent({
        name: 'ProductsFetchSuccess',
        properties: {
          source: 'dummyjson',
          userType: 'anonymous',
          resultCount: data?.products?.length ?? 0,
        },
      });

      if (data?.products?.length) {
        client.trackMetric({
          name: 'ProductsReturned',
          value: data.products.length,
        });
      }
    }

    return data;
  } catch (error) {
    console.error(`Error in getProducts: ${error.message}`, error.stack); // Log the actual error
    if (client) {
      client.trackException({
        exception: error, // The original error
        properties: { origin: 'bff/products', method: 'getProducts', message: error.message },
      });
    }
    // Re-throw the original error or a new generic error if preferred
    throw error;
    // Or: throw new Error('Failed to get products due to an internal error.');
  }
}
