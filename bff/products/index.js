import { fetchData } from '../utils/fetchData.js';
import appInsights from 'applicationinsights';

/**
 * Fetches product data from dummyjson.com.
 * @returns {Promise<import('../../types').ProductApiResponse>} A promise that resolves to the product data.
 */
export async function getProducts() {
  const client = appInsights.defaultClient;
  try {
    client.trackTrace({
      message: 'Calling dummyjson for products',
      severity: 1, // Info
      properties: { origin: 'bff/products', method: 'getProducts' },
    });

    const rawData = await fetchData('https://dummyjson.com/products');

    // Validate the structure of rawData before trying to access rawData.products
    if (typeof rawData !== 'object' || rawData === null || !Array.isArray(rawData.products)) {
      const errorMsg = 'Invalid data structure received from product API: products array not found or not an array.';
      console.error(errorMsg, 'Raw data:', rawData); // Log the problematic data
      // Track this specific error type if desired
      client.trackException({
        exception: new Error(errorMsg),
        properties: { origin: 'bff/products', method: 'getProducts', rawDataReceived: JSON.stringify(rawData, null, 2).substring(0, 1000) }
      });
      throw new Error(errorMsg);
    }

    // If validation passes, proceed with processing
    const processedProducts = rawData.products.map((product, index) => {
      const baseProduct = {
        ...product,
        images: product.images || [product.thumbnail], // Use thumbnail if images array is not available
        specifications: product.specifications || { general: "Basic " + product.title + " specifications." },
        // priceTiers will be handled below
        // Mock contract price for the first product
        contractPrice: index === 0 ? product.price * 0.8 : (product.contractPrice || null), // 20% discount for product 1
      };

      // Handle priceTiers for baseProduct
      if (index === 0) {
        baseProduct.priceTiers = [
          { quantity: 5, price: product.price * 0.9, label: 'each' }, // 10% discount for 5
          { quantity: 10, price: product.price * 0.85, label: 'each' } // 15% discount for 10
        ];
      } else {
        // For other products, ensure priceTiers is at least an empty array
        // or conforms if data is available from product.priceTiers
        baseProduct.priceTiers = product.priceTiers && Array.isArray(product.priceTiers) ?
          product.priceTiers.map(pt => ({
            quantity: typeof pt.quantity === 'number' ? pt.quantity : 0,
            price: typeof pt.price === 'number' ? pt.price : 0,
            label: typeof pt.label === 'string' ? pt.label : undefined
          })).filter(pt => pt.quantity > 0 && pt.price > 0) // Basic validation
          : [];
      }

      // Add mock variants to the first two products for demonstration
      if (index === 0) {
        baseProduct.variants = [
          {
            id: `${product.id}-variant1`,
            name: "Red Color",
            images: ["https://dummyjson.com/image/i/products/1/1.jpg", "https://dummyjson.com/image/i/products/1/2.jpg"],
            price: product.price + 10,
            specifications: { ...baseProduct.specifications, color: "Red", material: "Premium" },
            contractPrice: (product.price + 10) * 0.75, // 25% discount for this variant
            priceTiers: [ // Variant specific price tiers
              { quantity: 2, price: (product.price + 10) * 0.95, label: 'unit' }
            ],
          },
          {
            id: `${product.id}-variant2`,
            name: "Blue Color",
            images: ["https://dummyjson.com/image/i/products/1/3.jpg", "https://dummyjson.com/image/i/products/1/4.jpg"],
            price: product.price + 15,
            specifications: { ...baseProduct.specifications, color: "Blue", material: "Standard" },
            // This variant inherits contract price from base product (if any, or null)
          },
        ];
      } else if (index === 1) {
        // Mock contract price for the second product's base
        baseProduct.contractPrice = product.price * 0.85; // 15% discount

        baseProduct.variants = [
          {
            id: `${product.id}-variant-large`,
            name: "Large Size",
            price: product.price * 1.2,
            specifications: { ...baseProduct.specifications, size: "Large" },
            contractPrice: (product.price * 1.2) * 0.8, // 20% discount for this variant specifically
          },
        ];
      }

      return baseProduct;
    });

    const data = { ...rawData, products: processedProducts };

    client.trackEvent({
      name: 'ProductsFetchSuccess',
      properties: {
        source: 'dummyjson',
        userType: 'anonymous', // Assuming anonymous for now, can be enhanced with actual user context
        resultCount: data?.products?.length ?? 0,
      },
    });

    if (data?.products?.length) {
      client.trackMetric({
        name: 'ProductsReturned',
        value: data.products.length,
      });
    }

    return data;
  } catch (error) {
    client.trackException({
      exception: error,
      properties: { origin: 'bff/products', method: 'getProducts' },
    });
    throw error; // Re-throw the error so the caller can handle it
  }
}
