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

    // Process products to include new fields with default values if not provided
    const processedProducts = rawData.products.map((product, index) => {
      const baseProduct = {
        ...product,
        images: product.images || [product.thumbnail], // Use thumbnail if images array is not available
        specifications: product.specifications || { general: "Basic " + product.title + " specifications." },
        priceTiers: product.priceTiers || [],
        // Mock contract price for the first product
        contractPrice: index === 0 ? product.price * 0.8 : (product.contractPrice || null), // 20% discount for product 1
      };

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
